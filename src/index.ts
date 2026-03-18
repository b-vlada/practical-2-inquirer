import inquirer from 'inquirer';
import * as readline from 'readline';

interface Car {
  id: number;
  manufacturer: string;
  model: string;
  year: number;
  condition: 'новая' | 'б/у';
  price: number;
}

class CarCatalog {
  private cars: Car[] = [];
  private nextId: number = 1;

  createCar(
    manufacturer: string,
    model: string,
    year: number,
    condition: 'новая' | 'б/у',
    price: number
  ): Car {
    const newCar: Car = {
      id: this.nextId++,
      manufacturer,
      model,
      year,
      condition,
      price
    };
    this.cars.push(newCar);
    return newCar;
  }

  readAllCars(): Car[] {
    return this.cars;
  }

  readCarById(id: number): Car | undefined {
    return this.cars.find(c => c.id === id);
  }

  updateCar(
    id: number,
    updates: Partial<Omit<Car, 'id'>>
  ): Car | undefined {
    const carIndex = this.cars.findIndex(c => c.id === id);
    if (carIndex === -1) {
      return undefined;
    }
    this.cars[carIndex] = { ...this.cars[carIndex], ...updates };
    return this.cars[carIndex];
  }

  deleteCar(id: number): boolean {
    const carIndex = this.cars.findIndex(c => c.id === id);
    if (carIndex === -1) {
      return false;
    }
    this.cars.splice(carIndex, 1);
    return true;
  }
}

const catalog = new CarCatalog();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function showMainMenu(): Promise<void> {
  console.log('\n🚗 Каталог автомобилей');
  console.log('1. 📝 Добавить машину');
  console.log('2. 📋 Показать все машины');
  console.log('3. 🔍 Найти машину по ID');
  console.log('4. ✏️ Обновить машину');
  console.log('5. 🗑️ Удалить машину');
  console.log('6. ❌ Выход\n');

  const action = await askQuestion('Выберите действие (введите цифру 1-6): ');

  switch (action.trim()) {
    case '1':
      await addCar();
      break;
    case '2':
      await showAllCars();
      break;
    case '3':
      await findCarById();
      break;
    case '4':
      await updateCar();
      break;
    case '5':
      await deleteCar();
      break;
    case '6':
      console.log('\n👋 До свидания!');
      rl.close();
      process.exit(0);
      break;
    default:
      console.log('\n❌ Неверный ввод! Введите цифру от 1 до 6\n');
      await showMainMenu();
  }
}

async function addCar(): Promise<void> {
  console.log('\n📝 Добавление новой машины\n');

  const manufacturer = await askQuestion('Производитель: ');
  if (!manufacturer.trim()) {
    console.log('❌ Производитель обязателен!\n');
    await showMainMenu();
    return;
  }

  const model = await askQuestion('Модель: ');
  if (!model.trim()) {
    console.log('❌ Модель обязательна!\n');
    await showMainMenu();
    return;
  }

  const yearStr = await askQuestion('Год выпуска: ');
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 1886 || year > new Date().getFullYear() + 1) {
    console.log('❌ Некорректный год!\n');
    await showMainMenu();
    return;
  }

  let conditionInput = '';
  while (conditionInput !== 'новая' && conditionInput !== 'б/у') {
    conditionInput = await askQuestion('Состояние (введите "новая" или "б/у"): ');
    conditionInput = conditionInput.trim().toLowerCase();
    if (conditionInput !== 'новая' && conditionInput !== 'б/у') {
      console.log('❌ Введите "новая" или "б/у"');
    }
  }
  const condition = conditionInput as 'новая' | 'б/у';

  const priceStr = await askQuestion('Цена (₽): ');
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
    console.log('❌ Некорректная цена!\n');
    await showMainMenu();
    return;
  }

  const car = catalog.createCar(manufacturer, model, year, condition, price);
  console.log(`\n✅ Машина добавлена! ID: ${car.id}\n`);
  
  await showMainMenu();
}

async function showAllCars(): Promise<void> {
  console.log('\n📋 Список всех машин:\n');
  const cars = catalog.readAllCars();
  
  if (cars.length === 0) {
    console.log('📭 Каталог пуст\n');
  } else {
    cars.forEach(car => {
      console.log(`  ID: ${car.id}`);
      console.log(`  Производитель: ${car.manufacturer}`);
      console.log(`  Модель: ${car.model}`);
      console.log(`  Год: ${car.year}`);
      console.log(`  Состояние: ${car.condition}`);
      console.log(`  Цена: ${car.price.toLocaleString('ru-RU')} ₽`);
      console.log('  ---');
    });
    console.log('');
  }
  
  await showMainMenu();
}

async function findCarById(): Promise<void> {
  console.log('\n🔍 Поиск машины по ID\n');
  
  const idStr = await askQuestion('Введите ID машины: ');
  const id = parseInt(idStr);
  
  if (isNaN(id) || id <= 0) {
    console.log('❌ Некорректный ID!\n');
    await showMainMenu();
    return;
  }

  const car = catalog.readCarById(id);
  
  if (car) {
    console.log('\n🔍 Найденная машина:');
    console.log(`  ID: ${car.id}`);
    console.log(`  Производитель: ${car.manufacturer}`);
    console.log(`  Модель: ${car.model}`);
    console.log(`  Год: ${car.year}`);
    console.log(`  Состояние: ${car.condition}`);
    console.log(`  Цена: ${car.price.toLocaleString('ru-RU')} ₽\n`);
  } else {
    console.log(`\n❌ Машина с ID ${id} не найдена\n`);
  }
  
  await showMainMenu();
}

async function updateCar(): Promise<void> {
  console.log('\n✏️ Обновление машины\n');
  
  const idStr = await askQuestion('Введите ID машины для обновления: ');
  const id = parseInt(idStr);
  
  if (isNaN(id) || id <= 0) {
    console.log('❌ Некорректный ID!\n');
    await showMainMenu();
    return;
  }

  const car = catalog.readCarById(id);
  
  if (!car) {
    console.log(`\n❌ Машина с ID ${id} не найдена\n`);
    await showMainMenu();
    return;
  }

  console.log(`\n📝 Текущие данные: ${car.manufacturer} ${car.model}`);
  
  const manufacturer = await askQuestion(`Производитель (${car.manufacturer}): `);
  const model = await askQuestion(`Модель (${car.model}): `);
  
  const yearStr = await askQuestion(`Год выпуска (${car.year}): `);
  const year = yearStr.trim() ? parseInt(yearStr) : car.year;
  
  let conditionInput = '';
  while (conditionInput !== 'новая' && conditionInput !== 'б/у' && conditionInput !== '') {
    conditionInput = await askQuestion(`Состояние (${car.condition}): `);
    conditionInput = conditionInput.trim().toLowerCase();
    if (conditionInput && conditionInput !== 'новая' && conditionInput !== 'б/у') {
      console.log('❌ Введите "новая" или "б/у"');
    }
  }
  const condition = (conditionInput || car.condition) as 'новая' | 'б/у';
  
  const priceStr = await askQuestion(`Цена (${car.price} ₽): `);
  const price = priceStr.trim() ? parseFloat(priceStr) : car.price;

  const updatedCar = catalog.updateCar(car.id, {
    manufacturer: manufacturer.trim() || car.manufacturer,
    model: model.trim() || car.model,
    year: year,
    condition: condition,
    price: price
  });

  if (updatedCar) {
    console.log(`\n✅ Машина с ID ${updatedCar.id} обновлена!\n`);
  }
  
  await showMainMenu();
}

async function deleteCar(): Promise<void> {
  console.log('\n🗑️ Удаление машины\n');
  
  const idStr = await askQuestion('Введите ID машины для удаления: ');
  const id = parseInt(idStr);
  
  if (isNaN(id) || id <= 0) {
    console.log('❌ Некорректный ID!\n');
    await showMainMenu();
    return;
  }

  const success = catalog.deleteCar(id);
  
  if (success) {
    console.log(`\n✅ Машина удалена!\n`);
  } else {
    console.log(`\n❌ Машина с ID ${id} не найдена\n`);
  }
  
  await showMainMenu();
}

console.log('🚗 Добро пожаловать в каталог автомобилей!\n');
showMainMenu();