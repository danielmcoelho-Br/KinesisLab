# KinesisLab - Avaliação Fisioterapêutica Digital

O **KinesisLab** é uma aplicação web progressiva (PWA) desenvolvida para digitalizar e otimizar processos de avaliação fisioterapêutica e coleta de formulários clínicos, consolidando dados do paciente e gerando relatórios em PDF de forma automatizada. 

Esta é uma solução estática (Frontend) que prescinde de bancos de dados nativos na etapa atual, rodando diretamente no navegador com segurança e velocidade. Ideal para fisioterapeutas que buscam agilidade na coleta de testes ortopédicos, questionários validados e mapeamento da dor.

## 🚀 Principais Funcionalidades

- **Design Responsivo e Centrado no Usuário:** Funciona perfeitamente em tablets e desktops para o uso clínico no dia a dia.
- **Formulários Estruturados por Segmento:**
  - **Cervical:** Avaliação Funcional Completa, Índice NDI.
  - **Lombar:** Avaliação Funcional Completa, Questionário de Oswestry (ODI), Roland-Morris (LBPQ).
  - **Ombro (MMSS):** Avaliação de Força, Testes de Tensão Neural, Quick DASH, Pontos Gatilhos (15 músculos).
  - **Cotovelo/Mão:** Amplitude de Movimento, Testes Especiais, Força de Preensão e Pinça.
  - **Membros Inferiores (MMII):** Avaliação Funcional de Joelho, Quadril e Tornozelo (AOFAS, IKDC, WOMAC).
  - **Geriatria:** Avaliação Geriátrica, BPI-SF, MAN (Nutricional), VES-13, SPPB.
- **Mapeamento Corporal Interativo (Esquema da Dor):** Ferramenta de desenho `Canvas` integrada que permite sinalizar, com diferentes cores ou pincéis, os locais exatos da dor reportada no corpo humano.
- **Mapeamento de Sensibilidade:** Painel para sinalizar dermatomas e sensibilidade através de testes de monofilamentos com cores correspondentes a cada grau.
- **Geração de Relatórios em PDF:** Consolidando scores matemáticos e quadros clínicos instantaneamente em um só laudo via `html2pdf`.
- **Compartilhamento Rápido (WhatsApp):** Integração com a API do WhatsApp para envio automático do PDF/Link para o paciente.

## 🛠️ Tecnologias Utilizadas

A estrutura atual foi pensada para ser leve, portátil e de fácil edição:
- **HTML5 & CSS3** (Vanilla, sem dependências de frameworks pesados de estilização)
- **JavaScript Moderno (ES6+)** - Controle completo de estado, cálculos matemáticos das escalas e renderização assíncrona.
- **html2pdf.js** - Para geração limpa de documentos unificados após o preenchimento.

## 💻 Como Rodar o Projeto Localmente

Por se tratar de uma aplicação front-end pura que utiliza módulos e *Canvas* (imagens que podem sofrer bloqueio de CORS se abertas diretamente via `file://`), é altamente recomendável iniciar o projeto com um servidor de arquivos local.

### Pré-requisitos
- Um navegador de internet atualizado (Chrome, Safari, Firefox, Edge).
- Uma ferramenta para servir arquivos locais simples (ex: Python, Node.js Live Server).

### Passos de Instalação

1. Clone o repositório em sua máquina:
   ```bash
   git clone https://github.com/danielmcoelho-Br/KinesisLab.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd KinesisLab
   ```

3. Inicie um Servidor Local:
   - Se possuir **Python 3** instalado (Mac/Linux costumam vir de fábrica):
     ```bash
     python3 -m http.server 8080
     ```
   - Ou utilizando o Node.js (`http-server`):
     ```bash
     npx http-server -p 8080
     ```

4. Abra o navegador e acesse:
   ```text
   http://localhost:8080
   ```

## 📋 Como Usar a Plataforma

1. **Dashboard Inicial:** Selecione a área corporal ou a técnica desejada clicando nos cartões (ex: "Cervical", "Ombro", etc).
2. **Dados do Paciente:** Ao selecionar um questionário, preencha os dados do paciente (nome e idade). 
3. **Avaliação Prática:**
   - Preencha os campos e caixas de seleção.
   - Utilize a ferramenta de **Esquema Corporal** desenhando com o mouse/touch por cima das imagens em exibição.
4. **Finalizar a Avaliação:** Ao chegar no fim do questionário, clique em **Finalizar e Ver Resultado**.
5. O sistema formatará todos os resultados preenchidos, incluindo o score total (se aplicável) e as marcações desenhadas, na tela de Resultados.
6. A partir da visualização, escolha **Baixar Relatório (PDF)** ou **Compartilhar (WhatsApp)**.

## 📝 Licença

Desenvolvido exclusivamente para o dia a dia clínico - KinesisLab Fisioterapia.
