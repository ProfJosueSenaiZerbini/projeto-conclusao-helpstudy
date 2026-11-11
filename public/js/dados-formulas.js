// =====================================================================
// Dados da página Fórmulas rápidas
// Cada fórmula: titulo, formula, legenda (o que é cada letra) e exemplo
// =====================================================================
const FORMULAS = {
    matematica: {
        nome: 'Matemática',
        icone: 'fa-square-root-variable',
        cor: '#4A6CF7',
        lista: [
            { titulo: 'Área do retângulo', formula: 'A = b × h', legenda: 'b = base · h = altura', exemplo: 'b = 5 cm e h = 3 cm → A = 15 cm²' },
            { titulo: 'Área do triângulo', formula: 'A = (b × h) ÷ 2', legenda: 'b = base · h = altura', exemplo: 'b = 6 e h = 4 → A = 12' },
            { titulo: 'Área do círculo', formula: 'A = π × r²', legenda: 'π ≈ 3,14 · r = raio', exemplo: 'r = 2 → A ≈ 3,14 × 4 = 12,56' },
            { titulo: 'Comprimento da circunferência', formula: 'C = 2 × π × r', legenda: 'π ≈ 3,14 · r = raio', exemplo: 'r = 5 → C ≈ 31,4' },
            { titulo: 'Teorema de Pitágoras', formula: 'a² = b² + c²', legenda: 'a = hipotenusa · b e c = catetos', exemplo: 'b = 3 e c = 4 → a² = 25 → a = 5' },
            { titulo: 'Fórmula de Bhaskara', formula: 'Δ = b² − 4ac   ·   x = (−b ± √Δ) ÷ 2a', legenda: 'Para equações do tipo ax² + bx + c = 0', exemplo: 'x² − 5x + 6 = 0 → Δ = 1 → x = 2 ou x = 3' },
            { titulo: 'Porcentagem', formula: 'P = (x ÷ 100) × valor', legenda: 'x = porcentagem desejada', exemplo: '20% de 150 = 0,2 × 150 = 30' },
            { titulo: 'Juros simples', formula: 'J = C × i × t', legenda: 'C = capital · i = taxa (em decimal) · t = tempo', exemplo: 'C = 1000, i = 2% ao mês, t = 3 meses → J = 60' },
            { titulo: 'Juros compostos', formula: 'M = C × (1 + i)ᵗ', legenda: 'M = montante · C = capital · i = taxa · t = tempo', exemplo: 'C = 1000, i = 10%, t = 2 → M = 1210' },
            { titulo: 'Termo geral da PA', formula: 'aₙ = a₁ + (n − 1) × r', legenda: 'a₁ = 1º termo · n = posição · r = razão', exemplo: 'PA (2, 5, 8...) → a₁₀ = 2 + 9 × 3 = 29' },
            { titulo: 'Soma da PA', formula: 'Sₙ = (a₁ + aₙ) × n ÷ 2', legenda: 'a₁ = 1º termo · aₙ = último termo · n = quantidade', exemplo: '1 + 2 + ... + 100 = (1 + 100) × 100 ÷ 2 = 5050' },
            { titulo: 'Termo geral da PG', formula: 'aₙ = a₁ × qⁿ⁻¹', legenda: 'a₁ = 1º termo · q = razão · n = posição', exemplo: 'PG (3, 6, 12...) → a₅ = 3 × 2⁴ = 48' },
            { titulo: 'Volume do paralelepípedo', formula: 'V = a × b × c', legenda: 'a, b e c = comprimento, largura e altura', exemplo: '2 × 3 × 4 = 24 m³' },
            { titulo: 'Volume do cilindro', formula: 'V = π × r² × h', legenda: 'r = raio da base · h = altura', exemplo: 'r = 1 e h = 10 → V ≈ 31,4' },
            { titulo: 'Probabilidade', formula: 'P = casos favoráveis ÷ casos possíveis', legenda: 'O resultado vai de 0 a 1 (ou de 0% a 100%)', exemplo: 'Tirar 6 num dado: P = 1/6 ≈ 16,7%' },
            { titulo: 'Média aritmética', formula: 'M = (soma dos valores) ÷ (quantidade)', legenda: 'Some tudo e divida pelo número de valores', exemplo: '(7 + 8 + 9) ÷ 3 = 8' }
        ]
    },
    fisica: {
        nome: 'Física',
        icone: 'fa-atom',
        cor: '#3498DB',
        lista: [
            { titulo: 'Velocidade média', formula: 'Vm = ΔS ÷ Δt', legenda: 'ΔS = distância percorrida · Δt = tempo gasto', exemplo: '100 km em 2 h → Vm = 50 km/h' },
            { titulo: 'Velocidade no MUV', formula: 'V = V₀ + a × t', legenda: 'V₀ = velocidade inicial · a = aceleração · t = tempo', exemplo: 'V₀ = 0, a = 2 m/s², t = 5 s → V = 10 m/s' },
            { titulo: 'Posição no MUV ("sorvetão")', formula: 'S = S₀ + V₀t + (a × t²) ÷ 2', legenda: 'S₀ = posição inicial · V₀ = velocidade inicial · a = aceleração', exemplo: 'S₀ = 0, V₀ = 0, a = 2, t = 3 → S = 9 m' },
            { titulo: 'Equação de Torricelli', formula: 'V² = V₀² + 2 × a × ΔS', legenda: 'Usada quando o problema não fala do tempo', exemplo: 'V₀ = 0, a = 2, ΔS = 25 → V = 10 m/s' },
            { titulo: '2ª Lei de Newton', formula: 'F = m × a', legenda: 'F = força (N) · m = massa (kg) · a = aceleração (m/s²)', exemplo: 'm = 10 kg, a = 2 m/s² → F = 20 N' },
            { titulo: 'Força peso', formula: 'P = m × g', legenda: 'm = massa · g = gravidade (≈ 10 m/s² na Terra)', exemplo: 'm = 60 kg → P = 600 N' },
            { titulo: 'Trabalho', formula: 'τ = F × d × cos θ', legenda: 'F = força · d = deslocamento · θ = ângulo entre os dois', exemplo: 'F = 10 N, d = 5 m, θ = 0° → τ = 50 J' },
            { titulo: 'Energia cinética', formula: 'Ec = (m × v²) ÷ 2', legenda: 'm = massa (kg) · v = velocidade (m/s)', exemplo: 'm = 2, v = 3 → Ec = 9 J' },
            { titulo: 'Energia potencial gravitacional', formula: 'Ep = m × g × h', legenda: 'm = massa · g = gravidade · h = altura', exemplo: 'm = 2, g = 10, h = 5 → Ep = 100 J' },
            { titulo: 'Potência', formula: 'P = τ ÷ Δt', legenda: 'τ = trabalho ou energia (J) · Δt = tempo (s) · resultado em Watts (W)', exemplo: '600 J em 3 s → P = 200 W' },
            { titulo: 'Densidade', formula: 'd = m ÷ V', legenda: 'm = massa · V = volume', exemplo: 'm = 200 g, V = 100 cm³ → d = 2 g/cm³' },
            { titulo: 'Pressão', formula: 'p = F ÷ A', legenda: 'F = força · A = área · resultado em Pascal (Pa)', exemplo: 'F = 100 N, A = 2 m² → p = 50 Pa' },
            { titulo: 'Lei de Ohm', formula: 'U = R × i', legenda: 'U = tensão (V) · R = resistência (Ω) · i = corrente (A)', exemplo: 'R = 10 Ω, i = 2 A → U = 20 V' },
            { titulo: 'Potência elétrica', formula: 'P = U × i', legenda: 'U = tensão (V) · i = corrente (A)', exemplo: 'U = 220 V, i = 5 A → P = 1100 W' },
            { titulo: 'Equação das ondas', formula: 'v = λ × f', legenda: 'v = velocidade · λ = comprimento de onda · f = frequência', exemplo: 'λ = 2 m, f = 5 Hz → v = 10 m/s' },
            { titulo: 'Calor sensível ("Que MaCeTe")', formula: 'Q = m × c × ΔT', legenda: 'm = massa · c = calor específico · ΔT = variação de temperatura', exemplo: 'Água: m = 100 g, c = 1 cal/g°C, ΔT = 10 °C → Q = 1000 cal' },
            { titulo: 'Conversão de temperatura', formula: 'C ÷ 5 = (F − 32) ÷ 9 = (K − 273) ÷ 5', legenda: 'C = Celsius · F = Fahrenheit · K = Kelvin', exemplo: '100 °C = 212 °F = 373 K' }
        ]
    },
    quimica: {
        nome: 'Química',
        icone: 'fa-flask',
        cor: '#27AE60',
        lista: [
            { titulo: 'Número de massa', formula: 'A = Z + N', legenda: 'A = massa · Z = prótons (número atômico) · N = nêutrons', exemplo: 'Sódio: Z = 11, N = 12 → A = 23' },
            { titulo: 'Número de mols', formula: 'n = m ÷ M', legenda: 'm = massa (g) · M = massa molar (g/mol)', exemplo: '36 g de água (M = 18) → n = 2 mol' },
            { titulo: 'Constante de Avogadro', formula: '1 mol = 6,02 × 10²³ partículas', legenda: 'Vale para átomos, moléculas ou íons', exemplo: '2 mol de água = 12,04 × 10²³ moléculas' },
            { titulo: 'Volume molar (CNTP)', formula: '1 mol de gás = 22,4 L', legenda: 'Nas CNTP: 0 °C e 1 atm', exemplo: '2 mol de O₂ ocupam 44,8 L' },
            { titulo: 'Concentração comum', formula: 'C = m ÷ V', legenda: 'm = massa do soluto (g) · V = volume da solução (L)', exemplo: '20 g de sal em 2 L → C = 10 g/L' },
            { titulo: 'Concentração molar (molaridade)', formula: 'M = n ÷ V', legenda: 'n = mols do soluto · V = volume da solução (L)', exemplo: '0,5 mol em 1 L → 0,5 mol/L' },
            { titulo: 'Título', formula: 'τ = m₁ ÷ m', legenda: 'm₁ = massa do soluto · m = massa da solução', exemplo: '10 g de soluto em 100 g de solução → τ = 0,1 (10%)' },
            { titulo: 'Diluição', formula: 'C₁ × V₁ = C₂ × V₂', legenda: 'C = concentração · V = volume (antes e depois)', exemplo: 'C₁ = 10 g/L, V₁ = 1 L, V₂ = 2 L → C₂ = 5 g/L' },
            { titulo: 'Equação dos gases (Clapeyron)', formula: 'P × V = n × R × T', legenda: 'P = pressão (atm) · V = volume (L) · n = mols · R = 0,082 · T = temperatura (K)', exemplo: '1 mol a 273 K e 1 atm → V ≈ 22,4 L' },
            { titulo: 'Transformação gasosa', formula: '(P₁ × V₁) ÷ T₁ = (P₂ × V₂) ÷ T₂', legenda: 'A temperatura sempre em Kelvin', exemplo: 'Se P dobra com T constante, o V cai pela metade' },
            { titulo: 'pH', formula: 'pH = −log [H⁺]', legenda: '[H⁺] = concentração de íons H⁺ (mol/L)', exemplo: '[H⁺] = 10⁻³ → pH = 3 (ácido)' },
            { titulo: 'pH e pOH', formula: 'pH + pOH = 14', legenda: 'Vale a 25 °C · pH < 7 ácido · pH = 7 neutro · pH > 7 básico', exemplo: 'pOH = 4 → pH = 10 (básico)' },
            { titulo: 'Densidade', formula: 'd = m ÷ V', legenda: 'm = massa · V = volume', exemplo: '50 g em 25 mL → d = 2 g/mL' },
            { titulo: 'Rendimento', formula: 'R = (obtido ÷ teórico) × 100', legenda: 'Quanto do produto esperado foi realmente formado', exemplo: '8 g obtidos de 10 g esperados → 80%' }
        ]
    }
};
