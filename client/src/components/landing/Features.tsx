import { MonitorPlay, Trophy, Users, CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: 'Современная платформа',
    description: 'Всё обучение проходит на нашей собственной удобной онлайн-платформе с личным кабинетом, трекингом прогресса и автоматической проверкой домашнего задания.',
    icon: MonitorPlay,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Индивидуальный подход',
    description: 'Мы проводим занятия индивидуально или в небольших группах до 6 человек. Преподаватель уделяет внимание каждому ученику и отвечает на все вопросы.',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Мотивация и геймификация',
    description: 'За правильно выполненные домашние задания ученики получают бонусные баллы, которые можно обменять на реальные призы от нашей школы.',
    icon: Trophy,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Контроль качества',
    description: 'Следующий урок открывается только после успешной сдачи домашнего задания на 100 баллов и посещения текущего урока. Прогресс виден родителям.',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Почему выбирают нас?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы создали идеальную экосистему для эффективного онлайн-обучения программированию.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
