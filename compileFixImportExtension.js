import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function addJsExtensionToImports(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
        const filepath = join(dir, file);

        if (statSync(filepath).isDirectory()) {
            addJsExtensionToImports(filepath);
        } else if (filepath.endsWith('.js')) {
            let content = readFileSync(filepath, 'utf8');
            // Adjust the regex pattern to handle multiple cases
            content = content.replace(/from "(.*?)(?=";)/g, function(match, p1) {
                // Don't add .js to node_modules imports or if it already has an extension
                if (p1.startsWith(".") && !p1.endsWith(".js")) {
                    return `from "${p1}.js`;
                }
                return match;
            });
            writeFileSync(filepath, content);
        }
    }
}

addJsExtensionToImports('build');  // Adjust path if necessary
