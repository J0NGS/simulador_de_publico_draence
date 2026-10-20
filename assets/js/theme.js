/**
 * ============================================
 * DRAENCE — TEMA CLARO / ESCURO
 * ============================================
 * Segue o tema do sistema até o usuário escolher manualmente; a escolha
 * fica salva no navegador. Carregado no <head> para evitar o "flash"
 * de tema errado antes da pintura.
 */
(function () {
    const STORAGE_KEY = 'draence-theme';
    const root = document.documentElement;
    const media = globalThis.matchMedia('(prefers-color-scheme: dark)');

    function lerTemaSalvo() {
        try {
            const salvo = localStorage.getItem(STORAGE_KEY);
            return salvo === 'light' || salvo === 'dark' ? salvo : null;
        } catch (e) {
            return null;
        }
    }

    function temaAtual() {
        return root.dataset.theme || (media.matches ? 'dark' : 'light');
    }

    function atualizarMetaCor() {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        meta.content = temaAtual() === 'dark' ? '#171c14' : '#eef3e1';
    }

    function atualizarBotao() {
        const botao = document.querySelector('.theme-toggle');
        if (!botao) return;
        const escuro = temaAtual() === 'dark';
        const rotulo = escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro';
        botao.setAttribute('aria-label', rotulo);
        botao.title = rotulo;
    }

    const salvo = lerTemaSalvo();
    if (salvo) root.dataset.theme = salvo;

    document.addEventListener('DOMContentLoaded', function () {
        atualizarMetaCor();
        atualizarBotao();

        const botao = document.querySelector('.theme-toggle');
        if (botao) {
            botao.addEventListener('click', function () {
                const novo = temaAtual() === 'dark' ? 'light' : 'dark';
                root.dataset.theme = novo;
                try {
                    localStorage.setItem(STORAGE_KEY, novo);
                } catch (e) {
                    /* armazenamento indisponível: a troca vale só nesta visita */
                }
                atualizarMetaCor();
                atualizarBotao();
            });
        }
    });

    // Sem escolha manual, acompanha mudanças do tema do sistema
    media.addEventListener('change', function () {
        if (lerTemaSalvo()) return;
        atualizarMetaCor();
        atualizarBotao();
    });
})();
