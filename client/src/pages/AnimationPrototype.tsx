import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward } from 'lucide-react';
import { Link } from 'wouter';

export default function AnimationPrototype() {
  const [animationStage, setAnimationStage] = useState<'initial' | 'zoom' | 'enter' | 'form'>('initial');
  const [showSkipButton, setShowSkipButton] = useState(true);

  useEffect(() => {
    // Sequência automática da animação
    const timers = [
      setTimeout(() => setAnimationStage('zoom'), 2000),      // 2s: Inicia zoom
      setTimeout(() => setAnimationStage('enter'), 3500),     // 3.5s: Entra pela janela
      setTimeout(() => setAnimationStage('form'), 4500),      // 4.5s: Mostra formulário
      setTimeout(() => setShowSkipButton(false), 4500),       // Esconde botão de pular
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const skipAnimation = () => {
    setAnimationStage('form');
    setShowSkipButton(false);
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Botão de pular animação */}
      <AnimatePresence>
        {showSkipButton && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={skipAnimation}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-lg text-white transition-all"
          >
            <SkipForward className="w-4 h-4" />
            Pular Animação
          </motion.button>
        )}
      </AnimatePresence>

      {/* Botão de voltar */}
      <Link href="/corretor">
        <button className="fixed top-6 left-6 z-50 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-lg text-white transition-all">
          <X className="w-5 h-5" />
        </button>
      </Link>

      {/* Stage 1-3: Animação do prédio */}
      <AnimatePresence>
        {animationStage !== 'form' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
          >
            {/* Background com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100" />

            {/* Imagem do prédio */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              initial={{ scale: 0.6, y: 100 }}
              animate={{
                scale: animationStage === 'initial' ? 0.6 : animationStage === 'zoom' ? 1.8 : 2.5,
                y: animationStage === 'initial' ? 100 : animationStage === 'zoom' ? -50 : -150,
                x: animationStage === 'enter' ? 100 : 0,
              }}
              transition={{
                duration: animationStage === 'initial' ? 2 : 1.5,
                ease: [0.43, 0.13, 0.23, 0.96], // Easing cinematográfico
              }}
            >
              <img
                src="/images/fachadasemregency.png"
                alt="Regency Square Smart Stay"
                className="max-w-full max-h-full object-contain"
              />

              {/* Overlay de janela (target do zoom) */}
              {animationStage === 'zoom' && (
                <motion.div
                  className="absolute w-16 h-20 border-4 border-white/80 rounded-lg shadow-2xl"
                  style={{
                    top: '38%',
                    left: '58%',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
              )}
            </motion.div>

            {/* Efeito de partículas/luz ao entrar */}
            {animationStage === 'enter' && (
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.6 }}
              />
            )}

            {/* Texto de introdução */}
            {animationStage === 'initial' && (
              <motion.div
                className="absolute bottom-20 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Regency Square Smart Stay</h1>
                <p className="text-lg text-gray-600">Simulador de Investimento</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 4: Formulário */}
      <AnimatePresence>
        {animationStage === 'form' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-background"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-full max-w-2xl p-8 bg-card rounded-2xl border border-border shadow-2xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Área do Investidor</h2>
                <p className="text-muted-foreground">
                  Simule o fluxo de pagamento e descubra o potencial do seu investimento
                </p>
              </div>

              {/* Formulário de exemplo */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Unidade</label>
                  <select className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Selecione uma unidade</option>
                    <option>701 - DUPLEX - R$ 754.377,58</option>
                    <option>702 - STUDIO - R$ 330.667,15</option>
                    <option>703 - DUPLEX - R$ 762.347,77</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Entrada (%)</label>
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Parcelas</label>
                    <input
                      type="number"
                      placeholder="42"
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold text-lg transition-colors">
                  Calcular Fluxo de Investimento
                </button>

                <div className="text-center">
                  <Link href="/corretor">
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Ir para o simulador completo →
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de progresso */}
      {animationStage !== 'form' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          <div className={`w-2 h-2 rounded-full transition-all ${animationStage === 'initial' ? 'bg-white w-8' : 'bg-white/40'}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${animationStage === 'zoom' ? 'bg-white w-8' : 'bg-white/40'}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${animationStage === 'enter' ? 'bg-white w-8' : 'bg-white/40'}`} />
        </div>
      )}
    </div>
  );
}
