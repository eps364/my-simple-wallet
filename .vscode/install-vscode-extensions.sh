#!/bin/bash

echo "🚀 Instalando extensões do VS Code para My Simple Wallet..."
echo "📋 Versão organizada sem duplicatas"
echo ""

extensions=(
    # Tasks & Productivity
    "actboy168.tasks"
    "malsyned.vscode-command-task"
    "spmeesseman.vscode-taskexplorer"
    "sandy081.todotasks"
    "wayou.vscode-todo-highlight"
    "gruntfuggly.todo-tree"
    "alefragnani.bookmarks"
    
    # Java Development
    "redhat.java"
    "vscjava.vscode-java-pack"
    "vscjava.vscode-java-debug"
    "vscjava.vscode-java-dependency"
    "vscjava.vscode-java-test"
    "vscjava.vscode-lombok"
    "vscjava.vscode-maven"
    "vscjava.vscode-gradle"
    "dgileadi.java-decompiler"
    "shengchen.vscode-checkstyle"
    "sohibe.java-generate-setters-getters"
    
    # Spring Boot
    "developersoapbox.vscode-springboot-developer-pack"
    "developersoapbox.vscode-springboot-snippets"
    "doggy8088.spring-boot-snippets"
    "loiane.java-spring-extension-pack"
    "vmware.vscode-spring-boot"
    "junjieli.spring-endpoints"
    "sandipchitale.vscode-spring-initializr-webview"
    "vscjava.vscode-spring-initializr"
    "vscjava.vscode-spring-boot-dashboard"
    
    # Frontend Development
    "ms-vscode.vscode-typescript-next"
    "bradlc.vscode-tailwindcss"
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
    "ms-vscode.vscode-json"
    "christian-kohler.path-intellisense"
    "zignd.html-css-class-completion"
    "formulahendry.auto-rename-tag"
    "steoates.autoimport-es6-ts"
    
    # Database
    "ms-mssql.sql-database-projects-vscode"
    "cweijan.vscode-postgresql-client2"
    "mtxr.sqltools"
    "mtxr.sqltools-driver-pg"
    
    # Docker & DevOps
    "ms-azuretools.vscode-containers"
    "ms-azuretools.vscode-docker"
    "ms-kubernetes-tools.vscode-kubernetes-tools"
    
    # Git & Version Control
    "chawki.emoji-commit"
    "islambouderbala.emoji-commits"
    "maixiaojie.git-emoji"
    "eamodio.gitlens"
    "github.vscode-pull-request-github"
    "github.vscode-github-actions"
    "mhutchie.git-graph"
    
    # API Development & Testing
    "humao.rest-client"
    "rangav.vscode-thunder-client"
    "42crunch.vscode-openapi"
    
    # Code Quality & AI
    "github.copilot"
    "github.copilot-chat"
    "sonarsource.sonarlint-vscode"
    "redhat.fabric8-analytics"
    "ryanluker.vscode-coverage-gutters"
    "visualstudioexptteam.intellicode-api-usage-examples"
    "visualstudioexptteam.vscodeintellicode"
    "streetsidesoftware.code-spell-checker"
    
    # Remote Development
    "ms-vscode.remote-containers"
    "ms-vscode-remote.remote-ssh"
    "ms-vscode.remote-explorer"
    
    # File Formats & Configuration
    "editorconfig.editorconfig"
    "redhat.vscode-xml"
    "redhat.vscode-yaml"
    "redhat.vscode-commons"
    
    # Markdown & Documentation
    "yzhang.markdown-all-in-one"
    "shd101wyy.markdown-preview-enhanced"
    "davidanson.vscode-markdownlint"
    
    # Utilities
    "ms-vscode.live-server"
    "ms-vscode.hexeditor"
    "janisdd.vscode-edit-csv"
    "mechatroner.rainbow-csv"
    "oderwat.indent-rainbow"
    
    # Themes & UI
    "pkief.material-icon-theme"
    "zhuangtongfa.material-theme"
    "ms-vscode.theme-tomorrow-kit"
    "github.github-vscode-theme"
    "dracula-theme.theme-dracula"
    
    # Language Support
    "ms-python.python"
    "ms-python.flake8"
    "ms-python.isort"
    "ms-dotnettools.csharp"
)

total=${#extensions[@]}
current=0
success=0
errors=0

for extension in "${extensions[@]}"; do
    current=$((current + 1))
    echo "📦 [$current/$total] Instalando: $extension"
    
    if code --install-extension "$extension" --force > /dev/null 2>&1; then
        echo "   ✅ Sucesso"
        success=$((success + 1))
    else
        echo "   ❌ Erro ao instalar $extension"
        errors=$((errors + 1))
    fi
    echo ""
done

echo "🎉 Instalação concluída!"
echo ""
echo "📊 Estatísticas:"
echo "   • Total de extensões: $total"
echo "   • Instaladas com sucesso: $success"
echo "   • Erros: $errors"
echo ""
echo "📂 Categorias instaladas:"
echo "   • Tasks & Productivity: 7 extensões"
echo "   • Java Development: 11 extensões"
echo "   • Spring Boot: 9 extensões"
echo "   • Frontend Development: 9 extensões"
echo "   • Database: 4 extensões"
echo "   • Docker & DevOps: 3 extensões"
echo "   • Git & Version Control: 7 extensões"
echo "   • API Development & Testing: 3 extensões"
echo "   • Code Quality & AI: 8 extensões"
echo "   • Remote Development: 3 extensões"
echo "   • File Formats & Configuration: 4 extensões"
echo "   • Markdown & Documentation: 3 extensões"
echo "   • Utilities: 5 extensões"
echo "   • Themes & UI: 5 extensões"
echo "   • Language Support: 4 extensões"
echo ""
echo "💡 Reinicie o VS Code para ativar todas as extensões!"