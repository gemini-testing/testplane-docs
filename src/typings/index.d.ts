declare module "*.png" {
    const value: string;
    export = value;
}

declare module "*.jpg" {
    const value: string;
    export = value;
}

declare module "docusaurus-plugin-yandex-metrica" {
    import type { PluginModule } from "@docusaurus/types";

    const plugin: PluginModule;
    export default plugin;
}
