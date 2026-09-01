import { useMemo, useRef, type CSSProperties } from "react";
import epiludeFooterSource from "./sources/epilude-footer.html?raw";

type EffectMode = "light" | "dark";

type FocusRole = "background" | "button" | "visual";

type FocusTarget = {
  selector: string;
  role: FocusRole;
  fit?: "cover" | "contain-square" | "wide-wordmark" | "portrait-stage";
  preserveTransform?: boolean;
};

type EffectDefinition = {
  title: string;
  source: string;
  background: string;
  targets: readonly FocusTarget[];
  theme?: {
    nativeMode?: EffectMode;
    lightBackground: string;
    darkBackground: string;
    invertBackground?: boolean;
  };
  transformSource?: (source: string, mode: EffectMode) => string;
};

const QILBO_WORDMARK_SVG = `<svg width="900" height="150" viewBox="0 0 900 150" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="450" y="128" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="155" font-weight="900" letter-spacing="4">QILBO</text></svg>`;

export type NeuformIsolatedEffectProps = {
  mode?: EffectMode;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
};

export const NEUFORM_ISOLATED_DEFAULTS = {
  mode: "dark",
  hue: 0,
  saturation: 1,
  brightness: 1,
} as const;

function transformEpiludeWordmarkSource(source: string, mode: EffectMode) {
  const palette = mode === "light"
    ? "[[8, 10, 15], [40, 48, 62], [85, 96, 116]]"
    : "[[255, 255, 255], [226, 232, 240], [191, 205, 225]]";

  return source
    .replace("<title>Epilude — Footer</title>", "<title>Qilbo Particle Wordmark</title>")
    .replace("aspect-ratio: 8.541554959785524;", "aspect-ratio: 5.333333333333333;")
    .replace(/var WORDMARK =[\s\S]*?'<\/svg>';/, `var WORDMARK = '${QILBO_WORDMARK_SVG}';`)
    .replace("var PALETTE = [[255, 255, 255], [226, 232, 240], [191, 205, 225]];", `var PALETTE = ${palette};`)
    .replace("a: 0.04 + 0.95 * band * Math.pow(flake, 1.8)", "a: 0.14 + 0.86 * band * Math.pow(flake, 1.8)");
}

const EFFECTS = {
  particleWordmark: {
    title: "Qilbo particle wordmark",
    source: epiludeFooterSource,
    background: "#161310",
    theme: {
      lightBackground: "#f4f7fb",
      darkBackground: "#161310",
    },
    transformSource: transformEpiludeWordmarkSource,
    targets: [{ selector: "#storm", role: "visual", fit: "wide-wordmark" }],
  },
} as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function effectBackground(definition: EffectDefinition, mode: EffectMode) {
  return definition.theme?.[`${mode}Background`] ?? definition.background;
}

function buildFocusedDocument(definition: EffectDefinition, mode: EffectMode) {
  const background = effectBackground(definition, mode);
  const source = definition.transformSource?.(definition.source, mode) ?? definition.source;
  const targetJson = JSON.stringify(definition.targets).replace(/</g, "\\u003c");
  const modeJson = JSON.stringify(mode);

  const focusStyle = `<style data-threeui-focus>
html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${background} !important; color-scheme: ${mode} !important; }
body { position: relative !important; display: flex !important; align-items: center !important; justify-content: center !important; }
body > * { visibility: hidden !important; }
body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }
[data-threeui-role="visual"] { position: relative !important; z-index: 1 !important; width: 100% !important; max-width: 100% !important; height: 100% !important; max-height: 100% !important; margin: auto !important; padding: 0 !important; overflow: hidden !important; opacity: 1 !important; filter: none !important; }
[data-threeui-role="visual"][data-threeui-fit="wide-wordmark"] { width: 100% !important; max-width: 100% !important; height: 100% !important; max-height: 100% !important; aspect-ratio: auto !important; padding: 0 !important; overflow: hidden !important; }
</style>`;

  const focusScript = `<script data-threeui-focus>
(function () {
  document.documentElement.dataset.sfMode = ${modeJson};
  var isolated = false;
  function isolate() {
    if (isolated) return;
    var specs = ${targetJson};
    var roots = [];
    specs.forEach(function (spec) {
      var element = document.querySelector(spec.selector);
      if (!element) return;
      element.setAttribute('data-threeui-role', spec.role);
      if (spec.fit) element.setAttribute('data-threeui-fit', spec.fit);
      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);
    });
    if (!roots.length) return;
    isolated = true;
    roots.forEach(function (root) {
      document.body.appendChild(root);
    });
    Array.from(document.body.children).forEach(function (element) {
      if (roots.indexOf(element) !== -1) return;
      element.style.display = 'none';
    });
    document.body.setAttribute('data-threeui-ready', '');
    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', isolate, { once: true });
  else isolate();
  window.addEventListener('load', isolate, { once: true });
})();
</script>`;

  return source
    .replace(/<\/head>/i, `${focusStyle}</head>`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}

export function NeuformIsolatedEffect({
  mode = NEUFORM_ISOLATED_DEFAULTS.mode,
  hue = NEUFORM_ISOLATED_DEFAULTS.hue,
  saturation = NEUFORM_ISOLATED_DEFAULTS.saturation,
  brightness = NEUFORM_ISOLATED_DEFAULTS.brightness,
  className,
  style,
}: NeuformIsolatedEffectProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const safeMode: EffectMode = mode === "light" ? "light" : "dark";
  const definition = EFFECTS.particleWordmark;
  const background = effectBackground(definition, safeMode);
  const source = useMemo(() => buildFocusedDocument(definition, safeMode), [definition, safeMode]);
  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);
  const filter = safeHue === 0 && safeSaturation === 1 && safeBrightness === 1
    ? undefined
    : `hue-rotate(${safeHue}deg) saturate(${safeSaturation}) brightness(${safeBrightness})`;

  return (
    <iframe
      ref={frameRef}
      className={className}
      data-mode={safeMode}
      title={definition.title}
      srcDoc={source}
      sandbox="allow-scripts"
      loading="eager"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background,
        filter,
        ...style,
      }}
    />
  );
}

export function TextAnimationCollection({
  variant: _variant = "particle-wordmark",
  mode = "dark",
  hue = 0,
  saturation = 1.0,
  brightness = 1.0,
  className,
  style,
}: NeuformIsolatedEffectProps & { variant?: string }) {
  return (
    <NeuformIsolatedEffect
      mode={mode}
      hue={hue}
      saturation={saturation}
      brightness={brightness}
      className={className}
      style={style}
    />
  );
}

