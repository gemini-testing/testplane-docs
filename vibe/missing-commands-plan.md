# План дополнения справочника команд Testplane

## Уточнение текущего объема

Пользователь подтвердил приоритет немобильной части. Этап 5 и мобильные ссылки этапа 6 (Android-гайд и dragAndDrop) отложены. Текущая последовательность: завершенные этапы 1–4 → немобильная часть этапа 6 → этап 7 для 28 новых методов. Мобильные 11 методов остаются в плане и не считаются выполненными. Финальная проверка getContexts будет выполнена вместе с мобильной частью.

## Задача

Дополнить справочник публичных команд актуальной Testplane v9: описать недостающие команды browser, element и mock на английском и русском языках. Создать 39 страниц в каждой локали — всего 78 новых MDX-файлов. Обновить связанные страницы без изменения реализации Testplane и html-reporter.

Использовать редакционные правила `infradocs-yfm-writer`, сохраняя фактическую платформу Docusaurus/MDX, шаблоны страниц и якоря `{/* #anchor */}`. Не переносить проект на YFM и не создавать `toc.yaml`. Архив v8 и его переводы в этот план не включать.

## Рабочие каталоги и источники

-   Документация: `/Users/sipayrt/.codex/worktrees/missing-command-docs/testplane-docs`, ветка `codex/missing-command-docs`, база `7e662b60be11ac6813eca9c5d84c5142c043d01f`.
-   Testplane: `/Users/sipayrt/.codex/worktrees/missing-command-docs/testplane`, ветка `codex/missing-command-docs`, база `e19510b247523f40c23bf1dcbb719830220d6357`, версия 9.3.2.
-   html-reporter: `/Users/sipayrt/.codex/worktrees/missing-command-docs/html-reporter`, ветка `codex/missing-command-docs`, база `d24b6b72418a28f66ff5567f7b14a142b4b8d5e9`.
-   Для поведения унаследованных команд использовать `@testplane/webdriverio@9.6.2` из `testplane/package-lock.json`, а не произвольную текущую версию upstream WebdriverIO.
-   Закрепленный пакет распакован в `/private/tmp/testplane-command-audit/wdio-9.6.2/package`; SHA-512 архива сверена с lock-файлом. При отсутствии этой временной копии получить ту же версию через `npm pack @testplane/webdriverio@9.6.2 --ignore-scripts`.
-   Ниже пути документации считать относительно worktree `testplane-docs`; пути `src/` и `test/` в источниках Testplane — относительно worktree `testplane`.

## Структура плана

Выполнить последовательно: браузерные команды, команды элементов, сетевые моки, собственные расширения Testplane, мобильные команды, связанные исправления и навигация, итоговая проверка.

Для каждого нового файла `docs/<path>` создать русский эквивалент `i18n/ru/docusaurus-plugin-content-docs/current/<path>` с одинаковым API, примерами и якорями. Каждая страница должна содержать назначение, условия применимости, сигнатуру, параметры и значения по умолчанию, возвращаемое значение, ошибки и ограничения, пример Testplane и связанные команды. Использовать `async ({ browser }) => { ... }`, а не глобальный `browser` или `driver` из WDIO runner.

Не дублировать низкоуровневый справочник WebDriver/CDP/Appium, EventEmitter и методы объектов эмуляции отдельными страницами команд. `getElements()` не объявлять универсальным методом результата `browser.$$()`: учесть переопределение `$$` в `src/browser/existing-browser.ts`. Методы объектов `ClockManager` и `InitScript` описывать в соответствующих страницах `emulate` и `addInitScript`.

Дополнительное требование пользователя от 2026-10-09: создать отдельный проект через `npm init testplane@latest` и запускать каждый новый или измененный пример как настоящий тест. Публиковать пример только после успешного прогона; проверка синтаксиса, типов и подмена тестируемой команды не заменяют runtime-проверку. Сохранить соответствие «страница → файл теста → результат». Недоступность Selenium Grid или Appium фиксировать как незавершенную работу, а не как успешную проверку.

Все команды проверки ниже запускать из worktree `testplane-docs`. Перед редактурой установить зависимости через `npm ci` и выполнить базовые `npm test` и `npm run build`; сохранить исходные ошибки отдельно от результатов изменений.

## Этапы выполнения

### Этап 1: Браузерные команды — 11 страниц

**Что добавить:**

-   `addInitScript`: выполнение до скриптов страницы, BiDi, аргументы, возвращаемый объект, `remove()` и события `data`. Не копировать ошибочный пример с `reset()` из комментариев зависимости.
-   `addLocatorStrategy`, `custom$`, `custom$$`: регистрация стратегии, параметры, типы результатов, ошибки повторной регистрации и неизвестной стратегии.
-   `downloadFile`: выгрузка файла с Selenium Grid, `se:downloadsEnabled`, каталог назначения и связанные протокольные команды.
-   `emulate`, `restore`: поддерживаемые режимы, возвращаемые функции восстановления и объект часов; время применения и очистка в пределах того же теста. Отличить `restore()` от `restoreState()` и `mock.restore()`.
-   `setViewport`: размеры области страницы и `devicePixelRatio`, отличие от `setWindowSize`, требования BiDi.
-   `switchFrame`: формы аргумента, возврат в корневой фрейм через `null`, различия BiDi и Classic; строки и функции не объявлять поддержанными в Classic.
-   `throttleCPU`, `throttleNetwork`: требования CDP/Puppeteer, параметры и восстановление нормального режима; не приравнивать сетевое ограничение к `emulate("onLine")`.

**Файлы создать:**

-   `docs/commands/browser/addInitScript.mdx`
-   `docs/commands/browser/addLocatorStrategy.mdx`
-   `docs/commands/browser/customDollar.mdx`
-   `docs/commands/browser/customDollarDollar.mdx`
-   `docs/commands/browser/downloadFile.mdx`
-   `docs/commands/browser/emulate.mdx`
-   `docs/commands/browser/restore.mdx`
-   `docs/commands/browser/setViewport.mdx`
-   `docs/commands/browser/switchFrame.mdx`
-   `docs/commands/browser/throttleCPU.mdx`
-   `docs/commands/browser/throttleNetwork.mdx`
-   Русские эквиваленты всех перечисленных файлов.

**Источники и примеры:**

-   Пакет WDIO: `build/commands/browser/*.d.ts`, `build/types.d.ts`, `build/index.js`, `build/node.js`, `build/clock.d.ts`.
-   Testplane: `src/browser/commands/getPuppeteer.js`, `src/browser/existing-browser.ts`.
-   Документация: `docs/commands/browser/openAndWait.mdx`, `docs/basic-guides/user-environment-emulation.mdx`.

**Проверки:**

-   `npx --no-install prettier --check docs/commands/browser i18n/ru/docusaurus-plugin-content-docs/current/commands/browser`
-   `npm run build -- --locale en`
-   `npm run build -- --locale ru`

### Этап 2: Команды элементов — 7 страниц

**Что добавить:**

-   `custom$`, `custom$$`: область поиска относительно элемента, аргументы стратегии и возвращаемые элементы.
-   `execute`: элемент как первый аргумент браузерной функции, предварительное ожидание существования, дополнительные аргументы и результат.
-   `executeAsync`: callback последним аргументом, тайм-аут скрипта, предупреждение об устаревании и ссылка на `execute`; проверять ожидание элемента по реализации, а не переносить комментарий из WDIO автоматически.
-   `getElement`: получение объекта элемента и доступ к его свойствам; отличить от протокольного поиска элемента.
-   `isStable`, `waitForStable`: проверка геометрии между кадрами, ограничения неактивной вкладки, параметры ожидания; не обещать завершение любой анимации или сетевой загрузки. Для `waitForStable` описать `Promise<void>` по фактической реализации.

**Файлы создать:**

-   `docs/commands/element/customDollar.mdx`
-   `docs/commands/element/customDollarDollar.mdx`
-   `docs/commands/element/execute.mdx`
-   `docs/commands/element/executeAsync.mdx`
-   `docs/commands/element/getElement.mdx`
-   `docs/commands/element/isStable.mdx`
-   `docs/commands/element/waitForStable.mdx`
-   Русские эквиваленты всех перечисленных файлов.

**Источники и примеры:**

-   Пакет WDIO: `build/commands/element/*.d.ts`, соответствующие реализации в `build/index.js`, `build/scripts/isElementStable.js`.
-   Документация: `docs/commands/element/waitForDisplayed.mdx`, `docs/commands/browser/execute.mdx`.

**Проверки:**

-   `npx --no-install prettier --check docs/commands/element i18n/ru/docusaurus-plugin-content-docs/current/commands/element`
-   `npm run build -- --locale en`
-   `npm run build -- --locale ru`

### Этап 3: API сетевых моков — 6 страниц

**Что добавить:**

-   `waitForResponse`: ожидание хотя бы одного сохраненного ответа, параметры и ошибка тайм-аута; отдельно пояснить очистку старых вызовов.
-   `request`, `requestOnce`: изменение исходящего запроса, доступные поля и однократное применение.
-   `redirect`, `redirectOnce`: изменение URL запроса и однократное применение.
-   `reset`: очистка истории и правил перехвата без полного удаления мока; отличия от `clear` и `restore`.
-   Отметить, что `request`, `requestOnce`, `redirect`, `redirectOnce` и `reset` принадлежат BiDi-реализации мока; не обещать их для CDP и legacy WebDriver-перехвата.

**Файлы создать:**

-   `docs/commands/mock/waitForResponse.mdx`
-   `docs/commands/mock/request.mdx`
-   `docs/commands/mock/requestOnce.mdx`
-   `docs/commands/mock/redirect.mdx`
-   `docs/commands/mock/redirectOnce.mdx`
-   `docs/commands/mock/reset.mdx`
-   Русские эквиваленты всех перечисленных файлов.

**Источники и примеры:**

-   Пакет WDIO: `build/utils/interception/{index,bidi,devtools,webdriver,types}.d.ts` и соответствующие реализации в `build/index.js`.
-   Документация: `docs/commands/mock/respond.mdx`, `docs/commands/mock/restore.mdx`.

**Проверки:**

-   `npx --no-install prettier --check docs/commands/mock i18n/ru/docusaurus-plugin-content-docs/current/commands/mock`
-   `npm run build -- --locale en`
-   `npm run build -- --locale ru`

### Этап 4: Собственные расширения Testplane — 4 страницы

**Что добавить:**

-   `browser.extendOptions`: поверхностное изменение `browser.options`; отличить от конфигурации Testplane и capabilities уже созданной сессии.
-   `browser.unstable_captureDomSnapshot`: весь документ или CSS-селектор, фильтрация тегов и атрибутов, сокращение текста, поля результата и диагностические строки для некорректного или отсутствующего селектора.
-   `element.unstable_captureDomSnapshot`: снимок поддерева конкретного элемента; ссылкой переиспользовать общую семантику настроек и результата без копирования двух полных справочников.
-   `browser.unstable_getCdp`: собственный объект `CDP` Testplane либо `null`, ограничения подключения и отличие от `getPuppeteer`. Не предлагать закрывать общее соединение в пользовательском примере.
-   Для команд `unstable_*` явно обозначить нестабильный контракт. Не обещать, что DOM-снимок очищен от секретов.

**Файлы создать:**

-   `docs/commands/browser/extendOptions.mdx`
-   `docs/commands/browser/unstable_captureDomSnapshot.mdx`
-   `docs/commands/element/unstable_captureDomSnapshot.mdx`
-   `docs/commands/browser/unstable_getCdp.mdx`
-   Русские эквиваленты всех перечисленных файлов.

**Источники и примеры:**

-   Testplane: `src/browser/types.ts`, `src/browser/browser.ts`, `src/browser/commands/captureDomSnapshot.ts`, `src/browser/commands/unstable_getCdp.ts`, `src/browser/cdp/index.ts`.
-   Тесты: `test/src/browser/commands/captureDomSnapshot.ts`, `test/src/browser/existing-browser.js`.
-   Документация: `docs/commands/browser/getConfig.mdx`, `docs/commands/browser/getPuppeteer.mdx`.

**Проверки:**

-   `npx --no-install prettier --check docs/commands/browser docs/commands/element i18n/ru/docusaurus-plugin-content-docs/current/commands/browser i18n/ru/docusaurus-plugin-content-docs/current/commands/element`
-   `npm run build -- --locale en`
-   `npm run build -- --locale ru`

### Этап 5: Мобильные команды — 11 страниц

**Что добавить:**

-   `browser.swipe`, `browser.tap`: жест и нажатие по координатам, параметры, ограничения платформы и контекста. Для `swipe` закрепленная реализация требует native-контекст, несмотря на более широкое обещание в комментарии WDIO.
-   `browser.getContext`, `browser.getContexts`, `browser.switchContext`: обычные и подробные данные, native/webview, платформенные параметры и ожидания Android.
-   `browser.relaunchActiveApp`, `browser.deepLink`: перезапуск приложения и открытие ссылки, идентификатор приложения и требования Appium.
-   `element.tap`, `element.longPress`, `element.pinch`, `element.zoom`: действия над элементом, параметры жестов и поддерживаемые Appium-драйверы.
-   На каждой странице отделить наличие унаследованного метода от требований к мобильной сессии и драйверу. Не представлять эти команды как доступные в обычном desktop-браузере.

**Файлы создать:**

-   `docs/commands/browser/swipe.mdx`
-   `docs/commands/browser/tap.mdx`
-   `docs/commands/browser/getContext.mdx`
-   `docs/commands/browser/getContexts.mdx`
-   `docs/commands/browser/switchContext.mdx`
-   `docs/commands/browser/relaunchActiveApp.mdx`
-   `docs/commands/browser/deepLink.mdx`
-   `docs/commands/element/tap.mdx`
-   `docs/commands/element/longPress.mdx`
-   `docs/commands/element/pinch.mdx`
-   `docs/commands/element/zoom.mdx`
-   Русские эквиваленты всех перечисленных файлов.

**Источники и примеры:**

-   Пакет WDIO: `build/commands/mobile/*.d.ts`, соответствующие функции и проверки среды в `build/index.js`.
-   Документация: `docs/guides/android-testing.mdx`, `docs/commands/element/touchAction.mdx`, `docs/commands/element/dragAndDrop.mdx`.

**Проверки:**

-   `npx --no-install prettier --check docs/commands/browser docs/commands/element i18n/ru/docusaurus-plugin-content-docs/current/commands/browser i18n/ru/docusaurus-plugin-content-docs/current/commands/element`
-   `npm run build -- --locale en`
-   `npm run build -- --locale ru`

### Этап 6: Связанные исправления и навигация

**Что изменить:**

-   Исправить `commands/overview`: актуальная версия v9, группы новых команд и границы справочника относительно протокольного API.
-   Исправить `getState`: чтение JSON-файла без восстановления сессии, `stateOpts.path`, возврат `null` без пути, ошибки чтения; выровнять английский и русский текст.
-   Дополнить `url`: вызов без URL и параметры BiDi, включая ожидание загрузки, заголовки и `onBeforeLoad`; связать с `addInitScript`.
-   Обновить `mock`: требования Classic/CDP и BiDi, доступные методы, `calls` и события. Согласовать `abort`, `abortOnce`, `respond`, `respondOnce`, `clear`, `restore` с обеими реализациями без переписывания не затронутых примеров.
-   Добавить ссылки на новые страницы в существующий гайд эмуляции, раздел селекторов, Android-гайд и страницу `dragAndDrop`.
-   Для существующих `executeAsync` и `throttle` уточнить статус устаревания по закрепленному пакету и сослаться на рекомендуемые замены.
-   Проверить автоматическое включение новых страниц через `autogenerated` в `sidebars.ts`; сохранить текущую структуру. Не создавать ручные записи для каждого нового файла и не менять оглавление v8.

**Файлы изменить:**

-   `docs/commands/overview.mdx`
-   `docs/commands/browser/getState.mdx`
-   `docs/commands/browser/url.mdx`
-   `docs/commands/browser/mock.mdx`
-   `docs/commands/browser/executeAsync.mdx`
-   `docs/commands/browser/throttle.mdx`
-   `docs/commands/mock/abort.mdx`, `abortOnce.mdx`, `respond.mdx`, `respondOnce.mdx`, `clear.mdx`, `restore.mdx`
-   `docs/commands/element/dragAndDrop.mdx`
-   `docs/basic-guides/user-environment-emulation.mdx`
-   `docs/basic-guides/selectors.mdx`
-   `docs/guides/android-testing.mdx`
-   Русские эквиваленты всех перечисленных файлов.

**Источники и примеры:**

-   Testplane: `src/browser/commands/getState.ts`, `src/browser/existing-browser.ts`.
-   Пакет WDIO: `build/index.js`, `build/commands/browser/url.d.ts`, `build/commands/browser/executeAsync.d.ts`, `build/commands/browser/throttle.d.ts`.
-   Документация: `sidebars.ts`, `docusaurus.config.ts`, `docs/commands/browser/restoreState.mdx`.

**Проверки:**

-   `npm test`
-   `npm run build -- --locale en`
-   `npm run build -- --locale ru`

### Этап 7: Итоговая проверка документации

**Что проверить:**

-   Повторно сопоставить экспортируемые команды закрепленного WDIO, дополнения из `src/browser/types.ts` и созданные страницы; проверить наличие всех 39 новых страниц в обеих локалях.
-   Сверить каждую сигнатуру, значение по умолчанию, возвращаемое значение и ограничение с реализацией. При расхождении комментария или типа и кода не переносить противоречие в текст.
-   Проверить синтаксис примеров и отсутствие глобальных `$`, `$$`, `browser`, `driver` вне показанного контекста Testplane.
-   Проверить относительные ссылки, одинаковые явные якоря в парных локалях, таблицы, код и предупреждения на собранном сайте.
-   Просмотреть в браузере по одной странице каждого типа и наиболее сложные страницы `emulate`, `switchFrame`, `mock`, `unstable_captureDomSnapshot`, `getContexts` в обеих локалях.
-   Не объявлять примеры выполненными на реальном Selenium Grid или Appium-устройстве без отдельного успешного прогона в такой среде. В итоговом отчете явно отделить проверку по исходникам и сборку от runtime-проверки.
-   Подтвердить, что реализации Testplane/html-reporter, архив v8 и исходные рабочие каталоги не изменены.

**Команды:**

-   `npm test`
-   `npm run build -- --locale en`
-   `npm run build -- --locale ru`
-   `git diff --check`
-   `git status --short`

**Результат:**

-   Предоставить список новых и дополненных страниц, результаты проверок EN/RU и перечень не выполненных runtime-проверок. Не коммитить и не публиковать изменения без отдельного согласования.
