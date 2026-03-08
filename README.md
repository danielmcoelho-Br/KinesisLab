# KinesisLab - Avaliação Fisioterapêutica Digital

O **KinesisLab** é uma aplicação web progressiva (PWA) desenvolvida para digitalizar e otimizar processos de avaliação fisioterapêutica e coleta de formulários clínicos, consolidando dados do paciente e gerando relatórios em PDF de forma automatizada. 

Esta é uma solução moderna (Frontend + Supabase Cloud) rodando diretamente no navegador com segurança e velocidade. Ideal para fisioterapeutas que buscam centralizar avaliações, manter históricos e ter agilidade na coleta de testes ortopédicos, questionários validados e mapeamento da dor de qualquer dispositivo.

## 🚀 Principais Funcionalidades

- **Design Responsivo e Centrado no Usuário:** Funciona perfeitamente em tablets, celulares e desktops.
- **Banco de Dados em Nuvem Seguro (Supabase):** Sincronização em tempo real do histórico de avaliações do paciente. Você pode começar a avaliação num tablet e visualizar o resultado depois no seu computador.
- **Dashboard Histórico do Paciente:** Busque pacientes pelo nome e acesse todas as avaliações passadas com um clique.
- **Avaliação Rápida (Quick Flow):** Precisa aplicar um teste rápido sem cadastrar o paciente? O fluxo rápido permite fazer isso, com a opção flexível de vinculá-lo a um perfil no final.
- **Formulários Estruturados por Segmento:**
  - **Cervical:** Avaliação Funcional Completa, Índice NDI.
  - **Lombar:** Avaliação Funcional Completa, Questionário de Oswestry (ODI), Roland-Morris (LBPQ).
  - **Ombro (MMSS):** Avaliação de Força, Testes de Tensão Neural, Quick DASH, Pontos Gatilhos (15 músculos).
  - **Cotovelo/Mão:** Amplitude de Movimento, Testes Especiais, Força de Preensão e Pinça.
  - **Membros Inferiores (MMII):** Avaliação Funcional de Joelho, Quadril e Tornozelo (AOFAS, IKDC, WOMAC, Lysholm).
  - **Geriatria:** Avaliação Geriátrica, BPI-SF, MAN (Nutricional), VES-13, SPPB.
- **Mapeamento Corporal Interativo (Esquema da Dor):** Ferramenta de desenho `Canvas` integrada que permite sinalizar os locais exatos da dor reportada no corpo humano.
- **Geração de Relatórios em PDF:** Consolidando scores matemáticos e quadros clínicos instantaneamente em um só laudo via `html2pdf`.
- **Compartilhamento Rápido (WhatsApp):** Integração com a API do WhatsApp para envio automático do PDF/Link para o paciente.

## 🛠️ Tecnologias Utilizadas

A estrutura atual foi pensada para ser leve, portátil e de fácil edição:
- **HTML5 & CSS3** (Vanilla, sem dependências de frameworks pesados de estilização)
- **JavaScript Moderno (ES6+)** - Controle completo do estado lógico do paciente.
- **Supabase JS Client** - Para armazenar as tabelas remotas e trazer o histórico com facilidade (Backend-as-a-Service).
- **html2pdf.js** - Para geração limpa de documentos unificados após o preenchimento.
- **Chart.js** - Gráficos comparativos de Força e Déficit Lateral.

## 💻 Configurando a Base de Dados (Supabase)

O KinesisLab agora exige banco de dados online para guardar o histórico dos seus pacientes. Siga os passos:

1. Acesse o seu painel do [Supabase](https://supabase.com/).
2. Abra o **SQL Editor** no menu à esquerda.
3. Clique em **New query**.
4. Copie e cole o código SQL contido no arquivo de inicialização ou este abaixo, e clique em **Run**:

```sql
-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar a tabela patients
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    dominance TEXT,
    activity_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read/write to patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);

-- Criar a tabela assessments
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    segment TEXT NOT NULL,
    clinical_data JSONB,
    questionnaire_answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read/write to assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
```

Pronto! As credenciais JS já constam na aplicação `js/db.js`. O seu servidor agora está pronto para registrar dados vitais.

## 💻 Como Rodar o Projeto Localmente

Por se tratar de uma aplicação front-end pura que utiliza módulos e a internet, é recomendável iniciar o projeto com um servidor web para suprimir bloqueios de CORS locais.

1. Clone o repositório em sua máquina:
   ```bash
   git clone https://github.com/danielmcoelho-Br/KinesisLab.git
   ```

2. Acesse a pasta do projeto e inicie um Servidor Local. Se possuir **Python 3** instalado:
   ```bash
   python3 -m http.server 8080
   ```

3. Abra o navegador e acesse:
   ```text
   http://localhost:8080
   ```

## 📋 Como Usar a Plataforma

1. **Início (Pacientes Recentes):** A tela inicial agora busca ativamente pelos últimos pacientes que você avaliou no seu Supabase.
2. **Dashboard Histórico:** Busque ou clique no nome de um paciente listado para entrar em seu perfil. Você verá a lista de todas suas avaliações antigas registradas. Clique nelas para rever o seu resultado gerado sob medida!
3. **Novo Cadastro vs Avaliação Rápida:** Ao chegar, você pode criar um **Novo Paciente**, o que vai salvá-lo na nuvem para futuras consultas, ou criar uma **Avaliação Rápida**, onde você passará pela escala/teste diretamente, e o sistema lhe perguntará no fim se você deseja guardar na nuvem cadastrando os dados dele antes de fechar o atendimento.
4. **Finalizar a Avaliação:** O sistema formatará todos os resultados preenchidos, o score total, os dados clínicos do ombro/joelho e os mapeamentos em painéis limpos na tela visual final em HTML.
5. A partir da visualização, escolha **Imprimir / Salvar PDF** ou **Compartilhar (WhatsApp)**.

## 📝 Licença
Desenvolvido exclusivamente para o dia a dia clínico - KinesisLab Fisioterapia.
