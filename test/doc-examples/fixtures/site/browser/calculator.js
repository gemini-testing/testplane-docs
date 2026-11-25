const h = React.createElement;

function Button({ name, onPress }) {
    return h("button", { onClick: () => onPress(name) }, name);
}

function Calculator() {
    const [display, setDisplay] = React.useState("0");
    const [pending, setPending] = React.useState(null);
    const operations = {
        "÷": (a, b) => a / b,
        x: (a, b) => a * b,
        "-": (a, b) => a - b,
        "+": (a, b) => a + b,
    };
    function onPress(name) {
        if (operations[name]) {
            setPending({ value: Number(display), operation: name });
            setDisplay("0");
        } else if (name === "=") {
            if (pending)
                setDisplay(String(operations[pending.operation](pending.value, Number(display))));
            setPending(null);
        } else {
            setDisplay(String(Number(display + name)));
        }
    }
    const buttons = [..."0123456789", "÷", "x", "-", "+", "="];
    return h(
        "main",
        { className: "calculator" },
        h("output", { className: "component-display" }, display),
        ...buttons.map(name => h(Button, { key: name, name, orange: !/^\d$/.test(name), onPress })),
    );
}

const root = document.getElementById("root");
if (ReactDOM.createRoot) ReactDOM.createRoot(root).render(h(Calculator));
else ReactDOM.render(h(Calculator), root);
