export const highlight = (input: string): string => {
    return input
        .replace(/[\w$]+(?=\()/g, "<span class='text-green-400'>$&</span>")
        .replace(/"(?:\\.|[^"\\])*"/g, "<span class='text-pink-500'>$&</span>")
        .replace(/async|await|const/g, "<span class='text-violet-400 italic'>$&</span>");
};
