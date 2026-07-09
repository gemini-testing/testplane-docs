import type { HtmlTagObject, HtmlTags, PluginModule } from "@docusaurus/types";
import yandexMetricaPlugin from "docusaurus-plugin-yandex-metrica";

type HtmlTag = string | HtmlTagObject;

const yandexMetricaEventsPath = require.resolve("docusaurus-plugin-yandex-metrica/src/events.js");

const toArray = (tags?: HtmlTags): HtmlTag[] => {
    if (!tags) {
        return [];
    }

    return Array.isArray(tags) ? tags : [tags];
};

const isNoscriptTag = (tag: HtmlTag): tag is HtmlTagObject =>
    typeof tag !== "string" && tag.tagName === "noscript";

export const yandexMetricaFixedPlugin: PluginModule = async (context, options) => {
    const plugin = await yandexMetricaPlugin(context, options);

    if (plugin === null) {
        return null;
    }

    return {
        ...plugin,
        getClientModules() {
            return plugin.getClientModules?.().length ? [yandexMetricaEventsPath] : [];
        },
        injectHtmlTags(args) {
            const tags = plugin.injectHtmlTags?.(args) ?? {};
            const headTags = toArray(tags.headTags);
            const noscriptTags = headTags.filter(isNoscriptTag);

            // The upstream plugin puts <noscript><div>...</div></noscript> into <head>,
            // which is invalid HTML and triggers Docusaurus 3 minifier diagnostics.
            return {
                ...tags,
                headTags: headTags.filter(tag => !isNoscriptTag(tag)),
                postBodyTags: [...toArray(tags.postBodyTags), ...noscriptTags],
            };
        },
    };
};
