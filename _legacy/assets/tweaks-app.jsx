// Mounts the Tweaks panel and forwards values to the vanilla app via window.__applyTweaks.

(function () {
  const { useEffect } = React;

  function App() {
    const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

    // Push values whenever they change
    useEffect(() => {
      if (window.__applyTweaks) window.__applyTweaks(t);
    }, [t.accent, t.showB, t.particles, t.scrollSpeed, t.sectionBlur, t.cursor, t.lockAccent]);

    return (
      <TweaksPanel title="Tweaks">
        <TweakSection label="Cor de destaque" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#7c5cff', '#00e6a8', '#ff5b3a', '#3aa0ff', '#f0f0f0']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakToggle
          label="Travar cor (sem shift por seção)"
          value={t.lockAccent}
          onChange={(v) => setTweak('lockAccent', v)}
        />

        <TweakSection label="Cena 3D" />
        <TweakToggle
          label="Mostrar letra B"
          value={t.showB}
          onChange={(v) => setTweak('showB', v)}
        />
        <TweakSlider
          label="Densidade de partículas"
          value={t.particles}
          min={0} max={1500} step={50}
          onChange={(v) => setTweak('particles', v)}
        />

        <TweakSection label="Movimento" />
        <TweakSlider
          label="Velocidade do scroll suave"
          value={t.scrollSpeed}
          min={0.5} max={2.0} step={0.1} unit="s"
          onChange={(v) => setTweak('scrollSpeed', v)}
        />
        <TweakSlider
          label="Blur entre seções"
          value={t.sectionBlur}
          min={0} max={16} step={1} unit="px"
          onChange={(v) => setTweak('sectionBlur', v)}
        />

        <TweakSection label="Interação" />
        <TweakToggle
          label="Cursor custom"
          value={t.cursor}
          onChange={(v) => setTweak('cursor', v)}
        />
      </TweaksPanel>
    );
  }

  const mount = document.getElementById('tweaks-root');
  if (mount) {
    ReactDOM.createRoot(mount).render(<App />);
  }
})();
