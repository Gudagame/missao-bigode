/* Roteiro da história. a = imagens do quadro (a segunda entra por cima), v = voz:
   "s" Santa (narrador), "v" Santa grave (O Silencioso), "d" Dora (veterinária). */
const ABERTURA = [
  { a: ["H01_02"], fx: "chuva raio", quem: "Narrador", v: "s", txt: "Noite de chuva. Na Agência Secreta dos Bigodes, ninguém ligava havia dias.", som: "trovao" },
  { a: ["H01_03", "H02_03"], fx: "flick", quem: "Narrador", v: "s", txt: "Até que a lâmpada piscou. E os bigodes do detetive também.", som: "miau" },
  { a: ["H03_02", "H03_03"], quem: "Narrador", v: "s", txt: "Alguém passou um envelope por baixo da porta.", som: "papel" },
  { a: ["H04_01"], gesto: "envelope", quem: "O Silencioso", v: "v", instr: "Puxe o selo para abrir", txt: "Juno não sossega, e todos dizem que é manha. Venha logo, detetive. Vou apagar as pistas." },
  { a: ["H05_01", "H05_02"], extra: "cair", quem: "Narrador", v: "s", txt: "Ninguém nunca viu O Silencioso. Ele trabalha com o que ninguém repara.", som: "silencio" },
  { a: ["H06_01"], fx: "chuva", extra: "titulo", quem: "", v: "s", txt: "Missão Bigode. O Detetive dos Sinais.", som: "carimbo", atraso: 350 }
];
const HIST = {
  juno: [
    { a: ["H07_01", "H07_02"], fx: "chuva", quem: "Narrador", v: "s", txt: "Casa de Juno. A família jura que é só manha, por causa da areia nova.", som: "trovao" },
    { a: ["H08_01"], gesto: "foto", quem: "Narrador", v: "s", instr: "Esfregue a foto", txt: "Juno, um mês atrás, sempre no sofá. Guarde isso: comparar é o seu superpoder." },
    { a: ["H09_02"], gesto: "lanterna", quem: "Narrador", v: "s", instr: "Arraste a lanterna até Juno", txt: "Olhos no escuro. Achou! Na vida real, muitos gatos também se escondem quando algo não vai bem." },
    { a: ["H09_03", "E21_01"], quem: "Narrador", v: "s", txt: "Juno olhou para você e correu de volta para a caixa de areia.", som: "miau" },
    { a: ["H11_01", "H11_02"], fx: "chuva", extra: "tempo", quem: "O Silencioso", v: "v", txt: "Oitenta segundos, detetive. Depois disso, a casa é minha.", som: "silencio", atraso: 1100 }
  ]
};
/* [chegada, o que a família diz, provocação do Silencioso] e artes que substituem o quadro padrão */
const CHEGADA = {
  mia: ["Casa da Mia. Desde cedo, ela entra e sai da caixa de areia.", "A família acha que ela só está enjoada da areia.", "Uma mancha a mais, uma mancha a menos… Quem vai notar?", "C10_01"],
  theo: ["Casa do Theo. O pote de água esvaziou de novo.", "Deve ser o calor, dizem todos. Mas Theo está mais leve a cada mês.", "Sede não faz barulho, detetive. Eu adoro sinais assim."],
  bolota: ["Casa do Bolota. O sofá está ali, e ele só olha.", "Gordinho é bonitinho, diz a família, enchendo o pote outra vez.", "Um grão por dia, um petisco por vez. Meu trabalho é devagar."],
  nina: ["Casa da Nina. Tem ração no chão, outra vez.", "Se ela come, está tudo bem. É o que todo mundo pensa.", "A boca fica fechada, detetive. Quem vai olhar lá dentro?"],
  pipoca: ["Casa da Pipoca. Coça daqui, coça dali, coça de novo.", "Pelo branquinho, pontinhos escuros. Deve ser poeira, dizem.", "Sou pequeno como um grão de café. E pulo longe."],
  luna: ["Casa da Luna. Ela sacode a cabeça, e ninguém sabe por quê.", "Ela está ótima, olha os passarinhos, diz a família.", "Feche um olho, detetive. É o que eles fazem comigo."],
  faisca: ["Três da manhã, casa do Faísca. Um copo acaba de cair.", "Esse gato é um vilão, dizem todos, com sono.", "Deixe que ponham a culpa nele. Eu prefiro assim."],
  mel: ["Casa nova da Mel. Caixas por toda parte, e nenhum cantinho dela.", "Ela fez xixi no chão de propósito, reclama a família.", "Chamam de vingança. É o meu disfarce favorito."],
  bigodes: ["Casa do senhor Bigodes, quatorze anos de histórias.", "É só a idade, repetem, enquanto ele ronrona.", "A idade é o meu melhor esconderijo, detetive."],
  tom: ["Casa do Tom. Hoje, ninguém veio receber a família na porta.", "Deve ser só um mal-estar. Amanhã passa.", "Amanhã. Que palavra bonita."],
  zeca: ["Casa do Zeca. Ele dorme, come e olha a cidade. Está perfeito.", "Ele nunca sai de casa, para que veterinário?", "Nunca sai, nunca vai, nunca vê. Este é o meu último dossiê."],
  frida: ["Casa da Frida. A família saiu, e pediu para você dar uma olhada.", "Ela está ótima, até brincou hoje cedo.", "Flores frescas, detetive. O perigo também pode ser bonito."]
};
const FIM_SAGA = [
  { a: ["H30_01"], quem: "Narrador", v: "s", txt: "Treze casos, treze gatos. O quadro está completo.", som: "fio" },
  { a: ["P10_02", "H30_02"], quem: "O Silencioso", v: "v", txt: "Você reparou no que ninguém repara. Agora eu não tenho onde me esconder.", som: "silencio" },
  { a: ["H30_03"], extra: "confete", quem: "Doutora", v: "d", txt: "O Silencioso só existe quando ninguém olha. Continue olhando o seu gato todos os dias.", som: "vitoria" }
];
const FRASES = {
  quadro: ["Pistas no quadro. Agora, ligue as duas que decidem o caso.", "s"],
  urg: ["Quanta urgência este caso pede?", "s"],
  tempo: ["Tempo esgotado. A casa é minha.", "v"],
  venceu: ["Desta vez você me viu, detetive. Mas ainda há muitos gatos em silêncio.", "v"],
  perdeu: ["Quase não me viu, detetive. Eu adoro quando chamam de manha.", "v"],
  emerg: ["Na dúvida, ligue para o veterinário. Nunca dê remédio humano, e não espere para ver.", "d"],
  plantao: ["Plantão de emergência. Para cada situação, decida: agora, em breve ou observar.", "d"],
  rotina: ["Esta é a rotina do seu gato de verdade. Conhecer o normal é o que faz você notar a mudança.", "d"],
  perigo: ["Este caso era emergência. Na vida real, esperar poderia custar caro.", "d"]
};
function historiaDe(c) {
  if (HIST[c.id]) return HIST[c.id];
  const t = CHEGADA[c.id], p2 = n => String(n).padStart(2, "0"), h = "H" + (16 + c.n);
  return [
    { a: ["C31_" + p2(c.n - 1)], fx: "chuva", quem: "Narrador", v: "s", txt: t[0], som: "trovao" },
    { a: [t[3] || h + "_01"], quem: "Narrador", v: "s", txt: t[1], som: "papel" },
    { a: ["H11_01", "P10_02"], extra: "tempo", quem: "O Silencioso", v: "v", txt: t[2], som: "silencio", atraso: 1100 }
  ];
}
if (typeof module !== "undefined") module.exports = { ABERTURA, HIST, CHEGADA, FIM_SAGA, FRASES, historiaDe };
