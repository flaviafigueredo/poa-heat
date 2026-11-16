# Abertura (primeira etapa do projeto)

- Ao abrir a página, a Terra em 3D aparece e a câmera se aproxima até Porto Alegre. Depois, no scroll, começam os gráficos.
- Manter simples: usar uma biblioteca pronta de globo 3D, sem modelagem própria.
- Precisa funcionar bem no celular.
- Respeitar `prefers-reduced-motion`: quem desativa animações vê uma versão estática.
- Se travar, simplificar em vez de expandir.

## Visual da abertura

- Campo de estrelas sutil ao fundo (pequenas, apagadas, poucas mais brilhantes), só na abertura. A Terra usa foto de satélite de alta resolução com relevo (NASA Blue Marble Next Generation com topografia e batimetria, mais mapa de relevo). Atmosfera é só um brilho azul fino na borda. Sem reflexo especular, sem bordas cinza ou máscaras em degradê em volta do globo.
- Texturas do globo com no máximo 4096 px de largura, porque celulares mais antigos não carregam texturas maiores. Citar a NASA como fonte das imagens na seção de fontes.
- Texto sobre o globo precisa de um véu escuro por trás, para manter o contraste mesmo sobre partes claras da Terra.
