<style lang="scss">
tr {
    cursor: pointer;
}
td.expansion {
    cursor: default;
    /* Supprime le padding par defaut des cellules pour que le bandeau
       d'actions et le panneau de details s'alignent proprement. */
    padding: 0 !important;
}
/* Bandeau d'actions dans la ligne d'expansion : hauteur maitrisee */
td.expansion .v-banner__wrapper {
    padding: 4px 12px !important;
    border-bottom: none !important;
}
a {
    text-decoration: none;
}
</style>
