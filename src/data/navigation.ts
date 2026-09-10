export interface NavLink {
  name: string;
  href: string;
  id: string;
}

export interface NavCategory {
  title: string;
  path: string; // Nova rota base para a categoria
  links: NavLink[];
}

export const navigation: NavCategory[] = [
  {
    title: "Vida e Legado",
    path: "/vida-legado",
    links: [
      { id: "vida-familiar", name: "Família e Fé", href: "/vida-legado#vida-familiar" },
      { id: "iniciativa-fe", name: "Iniciativa na Fé", href: "/vida-legado#iniciativa-fe" },
      { id: "animais", name: "Animais e Amigos", href: "/vida-legado#animais" },
      { id: "amigos-escola", name: "Alegria e Escola", href: "/vida-legado#amigos-escola" },
    ]
  },
  {
    title: "Fé e Devoção",
    path: "/fe-devocao",
    links: [
      { id: "eucaristia", name: "Eucaristia", href: "/fe-devocao#eucaristia" },
      { id: "nossa-senhora", name: "Nossa Senhora", href: "/fe-devocao#nossa-senhora" },
      { id: "espiritualidade", name: "Espiritualidade", href: "/fe-devocao#espiritualidade" },
      { id: "comunicacao", name: "Santo da Comunicação", href: "/fe-devocao#comunicacao" },
    ]
  },
  {
    title: "Caminho da Santidade",
    path: "/santidade",
    links: [
      { id: "millennial", name: "Ciberapóstolo", href: "/santidade#millennial" },
      { id: "cruz-partida", name: "Cruz e Partida", href: "/santidade#cruz-partida" },
      { id: "santo-jeans", name: "Santo de Jeans", href: "/santidade#santo-jeans" },
      { id: "milagres", name: "Milagres", href: "/santidade#milagres" },
      { id: "conexao-brasil", name: "O Brasil e Carlo", href: "/santidade#conexao-brasil" },
    ]
  }
];
