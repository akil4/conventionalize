export function handleCompletionCommand(shell) {
    const targetShell = (shell || 'bash').toLowerCase();
    if (targetShell === 'zsh') {
        const zshScript = `#compdef conventionalize gcai

_conventionalize() {
    local -a commands
    commands=(
        'config:Configure API keys, AI model, default scope, and settings'
        'license:Activate or view Pro License status'
        'history:View commit history log across repositories'
        'stats:View commit analytics and type breakdown'
        'hook:Install or uninstall Git prepare-commit-msg hook'
        'completion:Generate shell autocompletion script'
    )

    _arguments -s \\
        '(-r --raw)'{-r,--raw}'[Output commit message directly to stdout]' \\
        '(-u --all-unstaged)'{-u,--all-unstaged}'[Include unstaged changes if no staged changes exist]' \\
        '(-d --debug)'{-d,--debug}'[Print verbose debug telemetry]' \\
        '(-h --help)'{-h,--help}'[Display help for command]' \\
        '(-V --version)'{-V,--version}'[Output version number]' \\
        '*::command:->subcmd'

    case "$state" in
        subcmd)
            _describe -t commands 'conventionalize commands' commands
            ;;
    esac
}

compdef _conventionalize conventionalize gcai
`;
        console.log(zshScript);
    }
    else {
        const bashScript = `# conventionalize bash completion
_conventionalize_bash() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    opts="-r --raw -u --all-unstaged -d --debug -h --help -V --version config license history stats hook completion"

    if [[ \${cur} == -* ]] ; then
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi
}
complete -F _conventionalize_bash conventionalize gcai
`;
        console.log(bashScript);
    }
}
