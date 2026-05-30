import { prisma } from '../src/infrastructure/db';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Start seeding...');

  // Password for all test users will be 'password123'
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@codeschool.ru' },
    update: {},
    create: {
      email: 'admin@codeschool.ru',
      phone: '+7 (999) 111-11-11',
      password: hashedPassword,
      role: 'admin',
      fullName: 'Иван Админов',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Create Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@codeschool.ru' },
    update: {},
    create: {
      email: 'manager@codeschool.ru',
      phone: '+7 (999) 222-22-22',
      password: hashedPassword,
      role: 'manager',
      fullName: 'Елена Менеджерова',
    },
  });
  console.log(`Created manager: ${manager.email}`);

  // 3. Create Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@codeschool.ru' },
    update: {},
    create: {
      email: 'teacher@codeschool.ru',
      phone: '+7 (999) 333-33-33',
      password: hashedPassword,
      role: 'teacher',
      fullName: 'Петр Преподавателев',
    },
  });
  console.log(`Created teacher: ${teacher.email}`);

  // 4. Create Users (Students)
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@mail.ru' },
    update: {},
    create: {
      email: 'student1@mail.ru',
      phone: '+7 (999) 444-44-41',
      password: hashedPassword,
      role: 'user',
      parentName: 'Алексей Студентов (Отец)',
      studentName: 'Маша Студентова',
      birthday: new Date('2014-05-15'),
      bonusPoints: 0,
    },
  });
  console.log(`Created student 1: ${student1.email}`);

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@mail.ru' },
    update: {},
    create: {
      email: 'student2@mail.ru',
      phone: '+7 (999) 444-44-42',
      password: hashedPassword,
      role: 'user',
      parentName: 'Ольга Студентова (Мать)',
      studentName: 'Саша Студентов',
      birthday: new Date('2010-08-20'),
      bonusPoints: 200,
    },
  });
  console.log(`Created student 2: ${student2.email}`);

  // 5. Create Courses
  const course1 = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Основы программирования в Scratch',
      description: 'Идеально для первого знакомства с алгоритмами и логикой.',
      ageCategory: '7-10',
      price: 4000,
    },
  });
  console.log(`Created course: ${course1.title}`);

  const course2 = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Создание игр на Roblox (Lua)',
      description: 'Учимся программировать и создавать свои 3D миры.',
      ageCategory: '11-14',
      price: 5000,
    },
  });
  console.log(`Created course: ${course2.title}`);

  const course3 = await prisma.course.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Web-разработка и React',
      description: 'Профессиональный курс для создания современных сайтов.',
      ageCategory: '15-17',
      price: 6500,
    },
  });
  console.log(`Created course: ${course3.title}`);

  // 6. Create Module & Lessons for Course 3
  const module1 = await prisma.module.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Введение в Web-разработку',
      description: 'Основы HTML, CSS и JS',
      courseId: course3.id,
      lessons: {
        create: [
          {
            title: 'Что такое HTML и CSS?',
            description: 'Базовые теги и стили.',
            content: 'HTML (HyperText Markup Language) — это стандартизированный язык гипертекстовой разметки документов. CSS — язык таблиц стилей...',
            orderNumber: 1,
            homework: {
              create: {
                description: 'Создайте свою первую веб-страничку с заголовком и картинкой.'
              }
            }
          },
          {
            title: 'Основы JavaScript',
            description: 'Переменные, циклы, функции.',
            content: 'JavaScript — это язык программирования, который позволяет реализовать сложное поведение на веб-страницах...',
            orderNumber: 2,
            homework: {
              create: {
                description: 'Напишите скрипт, который выводит Alert с приветствием при нажатии на кнопку.'
              }
            }
          }
        ]
      }
    }
  });
  console.log(`Created module: ${module1.title} with lessons and homeworks`);

  // 7. Create Group
  const group1 = await prisma.group.create({
    data: {
      name: 'React_Group_1',
      type: 'group',
      courseId: course3.id,
      teacherId: teacher.id,
      students: {
        create: [
          { studentId: student1.id },
          { studentId: student2.id }
        ]
      }
    }
  });
  console.log(`Created group: ${group1.name}`);

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
