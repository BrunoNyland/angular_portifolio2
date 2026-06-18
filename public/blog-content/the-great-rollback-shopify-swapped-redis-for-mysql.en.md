# The Great Rollback? Shopify Swapped Redis for MySQL

An extremely interesting case brought by the Brazilian channel [Mano Deyvin](https://www.youtube.com/watch?v=iiHvAo61H-w), sharing how Shopify – the e-commerce giant that handled an incredible $5.1 million USD per minute in sales during Black Friday 2025 – discarded Redis and resolved its biggest scalability bottleneck using only good old MySQL. [You can read the original engineering post from Shopify here](https://shopify.engineering/scaling-inventory-reservations).

The problem they needed to solve was a classic one: the nightmare of two people clicking "checkout" for the very last sneaker in stock at the exact same time. To prevent both from paying for the item (which leads to refunds and angry customers) or having the system block the sale for no reason, they use what is called "oversell protection."

For years, the architecture worked like this: Redis operated as a "fast lane" storing temporary reservations, while MySQL was the central database with the real inventory. The catch was that updating MySQL and clearing Redis at payment time was not a single atomic transaction. Basically, if the order of operations went out of sync, the store sold without deducting stock, or the inventory was deducted but remained locked as reserved in Redis. It was the chaos of keeping two systems synchronized.

Until the team decided to challenge the status quo and migrate everything inside MySQL. How? By using a MySQL 8 feature that has existed since 2018: `SKIP LOCKED`.

The stroke of genius was changing the data modeling: instead of having a row in the table saying `quantity = 10`, they moved to having one row in the database for each physical unit of the product. If you buy 3 units, the database selects and moves three rows in the same transaction. `SKIP LOCKED` works like a super-agile stockkeeper: if they see someone is already holding a box (row locked by another transaction), they skip to the next available box on the shelf without locking the system or creating queues. And to prevent the table from becoming massive and slow during queries, they limited everything to a "pool" of a maximum of 1,000 rows per item, which is replenished automatically.

But here comes the plot twist!

Even after optimizing everything, creating composite keys, and adjusting locks, performance hit a ceiling. Latency was fine and CPU usage was low, but the system simply wouldn't scale because database connections were running dry.

That's when some detective work happened. Engineers started adding tags to every SQL operation in the code to figure out who was "monopolizing" the database. The result? The problem wasn't even the reservations! Old parts of the checkout flow were holding onto connections for too long, just like that thoughtless neighbor occupying the parking spot and disappearing. The reservations were simply the "last straw" in a connection pool that was already at its limit.

The team cleaned up that checkout code (reducing transactions by 33%), adjusted an old MySQL thread configuration, and the system soared. They broke all records for Black Friday 2025, with the main database using less than 50% CPU.

The lesson here, reinforcing the thesis of what people call "The Great Rollback": before automatically throwing Redis, Kafka, or other complex tools to solve concurrency, take a close look at your relational database. It can probably get the job done and, many times, your true bottleneck is not the database, but rather the "piping" in the rest of your code.
