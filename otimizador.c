#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    // Verifica se os parâmetros foram passados corretamente no terminal
    // Exemplo : otimizador AN262 120 8500
    if (argc < 4) {
        printf("==================================================\n");
        printf(" PAINEL DE DIAGNOSTICO NEXUS ERROR: DADOS INCOMPLETOS      \n");
        printf("==================================================\n");
        printf(" Uso correto: ./otimizador [Voo] [Passageiros] [Distancia KM]\n");
        printf("==================================================\n");
        return 1;
    }

    // Captura os dados passados pelo terminal
    char *numeroVoo = argv[1];
    int totalPassageiros = atoi(argv[2]);
    double distanciaRota = atof(argv[3]);

    // Regras lógicas do motor da AeroNexus
    double pesoEstruturalAviao = 40000.0; // 40 toneladas do Boeing vazio
    
    // Na média do manifesto, o motor calcula o peso misto dos passageiros
    // considerando a proporção de adultos, crianças e bebês ativos
    double pesoMedioPassageiro = 75.0; 
    double pesoTotalPassageiros = totalPassageiros * pesoMedioPassageiro;
    
    // Cálculo do peso bruto total de decolagem
    double pesoDecolagemTotal = pesoEstruturalAviao + pesoTotalPassageiros;

    // Fórmula de consumo de combustível (Querosene de Aviação)
    // Consumo baseado na distância e na quantidade de carga/passageiros
    double consumoPorKmPorPax = 0.04; // 0.04 Litros por passageiro a cada KM
    double consumoCombustivel = distanciaRota * totalPassageiros * consumoPorKmPorPax;

    // Se o avião estiver muito leve (pouca distância), define um consumo mínimo de segurança
    if (consumoCombustivel < 5000.0) {
        consumoCombustivel = 5000.0;
    }

    // IMPRESSÃO LIMPA NO TERMINAL
    printf("\n==================================================\n");
    printf("        PAINEL DE DIAGNOSTICO NEXUS   \n");
    printf("==================================================\n");
    printf("  [Voo]: %s\n", numeroVoo);
    printf("  [Assentos Otimizados]: %d\n", totalPassageiros);
    printf("  [Distancia da Rota]: %.2f km\n", distanciaRota);
    printf("--------------------------------------------------\n");
    printf("  (Combustivel Estimado): %.2f Litros\n", consumoCombustivel);
    printf("  (Peso de Decolagem Total): %.2f kg\n", pesoDecolagemTotal);
    printf("--------------------------------------------------\n");
    printf("  > STATUS: ENGENHARIA DE ROTA CALCULADA COM SUCESSO.\n");
    printf("==================================================\n\n");

    return 0;
}

//gcc otimizador.c -o otimizador

// otimizador AN262 120 8500
            //numero o voo
                //numero de passageiros
                    //distancia da viagem