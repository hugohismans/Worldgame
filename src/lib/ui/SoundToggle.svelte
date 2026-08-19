<script lang="ts">
  import { audio } from '../audio/audio.svelte.js';
  import { i18n } from '../i18n/i18n.svelte.js';

  const label = $derived(audio.muted ? i18n.t.soundOff : i18n.t.soundOn);
</script>

<button
  type="button"
  class="sound"
  aria-pressed={audio.muted}
  aria-label={label}
  title={label}
  onclick={() => audio.toggle()}
>
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" stroke-linejoin="round" />
    {#if audio.muted}
      <path d="M16 9.5l4.5 5M20.5 9.5l-4.5 5" stroke-linecap="round" />
    {:else}
      <path d="M15.5 9.5a4 4 0 010 5M18 7a7.5 7.5 0 010 10" stroke-linecap="round" />
    {/if}
  </svg>
</button>

<style>
  .sound {
    display: grid;
    place-items: center;
    inline-size: 44px;
    block-size: 44px;
    border: 1px solid var(--trait);
    border-radius: 999px;
    background: var(--surface);
    color: var(--os-fane);
    cursor: pointer;

    &[aria-pressed='true'] {
      color: color-mix(in oklab, var(--os-fane) 60%, transparent);
    }
  }

  svg {
    inline-size: 20px;
    block-size: 20px;
  }
</style>
