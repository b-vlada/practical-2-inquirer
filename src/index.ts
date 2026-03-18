import inquirer from 'inquirer';

interface Car {
  id: number;
  manufacturer: string;
  model: string;
  year: number;
  condition: 'new' | 'used';
  price: number;
}

class CarCatalog {
  private cars: Car[] = [];
  private nextId: number = 1;

  createCar(
    manufacturer: string,
    model: string,
    year: number,
    condition: 'new' | 'used',
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

async function showMainMenu(): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '🚗 Каталог автомобилей - Выберите действие:',
      choices: [
        '📝 Добавить машину',
        '📋 Показать все машины',
        '🔍 Найти машину по ID',
        '✏️ Обновить машину',
        '🗑️ Удалить машину',
        '❌ Выход'
      ]
    }
  ]);

  await handleAction(action);
}

async function handleAction(action: string): Promise<void> {
  switch (action) {
    case '📝 Добавить машину':
      await addCar();
      break;
    case '📋 Показать все машины':
      await showAllCars();
      break;
    case '🔍 Найти машину по ID':
      await findCarById();
      break;
    case '✏️ Обновить машину':
      await updateCar();
      break;
    case '🗑️ Удалить машину':
      await deleteCar();
      break;
    case '❌ Выход':
      console.log('\n👋 До свидания!');
      process.exit(0);
      break;
  }
}

async function addCar(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'manufacturer',
      message: 'Производитель:',
      validate: (input: string) => input.trim() !== '' || 'Введите производителя'
    },
    {
      type: 'input',
      name: 'model',
      message: 'Модель:',
      validate: (input: string) => input.trim() !== '' || 'Введите модель'
    },
    {
      type: 'number',
      name: 'year',
      message: 'Год выпуска:',
      validate: (input: number) => {
        if (isNaN(input)) return 'Введите число';
        if (input < 1886 || input > new Date().getFullYear() + 1) return 'Некорректный год';
        return true;
      }
    },
    {
      type: 'list',
      name: 'condition',
      message: 'Состояние:',
      choices: ['new', 'used']
    },
    {
      type: 'number',
      name: 'price',
      message: 'Цена ($):',
      validate: (input: number) => {
        if (isNaN(input)) return 'Введите число';
        if (input <= 0) return 'Цена должна быть больше 0';
        return true;
      }
    }
  ]);

  const car = catalog.createCar(
    answers.manufacturer,
    answers.model,
    answers.year,
    answers.condition,
    answers.price
  );

  console.log(`\n✅ Машина добавлена! ID: ${car.id}\n`);
  await showMainMenu();
}

async function showAllCars(): Promise<void> {
  const cars = catalog.readAllCars();
  
  if (cars.length === 0) {
    console.log('\n📭 Каталог пуст\n');
  } else {
    console.log('\n📋 Список всех машин:');
    cars.forEach(car => {
      console.log(`\n  ID: ${car.id}`);
      console.log(`  Производитель: ${car.manufacturer}`);
      console.log(`  Модель: ${car.model}`);
      console.log(`  Год: ${car.year}`);
      console.log(`  Состояние: ${car.condition === 'new' ? 'Новая' : 'Б/У'}`);
      console.log(`  Цена: $${car.price}`);
      console.log('  ---');
    });
    console.log('');
  }
  
  await showMainMenu();
}

async function findCarById(): Promise<void> {
  const { id } = await inquirer.prompt([
    {
      type: 'number',
      name: 'id',
      message: 'Введите ID машины:',
      validate: (input: number) => {
        if (isNaN(input)) return 'Введите число';
        if (input <= 0) return 'ID должен быть больше 0';
        return true;
      }
    }
  ]);

  const car = catalog.readCarById(id);
  
  if (car) {
    console.log('\n🔍 Найденная машина:');
    console.log(`  ID: ${car.id}`);
    console.log(`  Производитель: ${car.manufacturer}`);
    console.log(`  Модель: ${car.model}`);
    console.log(`  Год: ${car.year}`);
    console.log(`  Состояние: ${car.condition === 'new' ? 'Новая' : 'Б/У'}`);
    console.log(`  Цена: $${car.price}\n`);
  } else {
    console.log(`\n❌ Машина с ID ${id} не найдена\n`);
  }
  
  await showMainMenu();
}

async function updateCar(): Promise<void> {
  const { id } = await inquirer.prompt([
    {
      type: 'number',
      name: 'id',
      message: 'Введите ID машины для обновления:',
      validate: (input: number) => {
        if (isNaN(input)) return 'Введите число';
        if (input <= 0) return 'ID должен быть больше 0';
        return true;
      }
    }
  ]);

  const car = catalog.readCarById(id);
  
  if (!car) {
    console.log(`\n❌ Машина с ID ${id} не найдена\n`);
    await showMainMenu();
    return;
  }

  console.log(`\n📝 Текущие данные: ${car.manufacturer} ${car.model}`);
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'manufacturer',
      message: 'Производитель:',
      default: car.manufacturer
    },
    {
      type: 'input',
      name: 'model',
      message: 'Модель:',
      default: car.model
    },
    {
      type: 'number',
      name: 'year',
      message: 'Год выпуска:',
      default: car.year
    },
    {
      type: 'list',
      name: 'condition',
      message: 'Состояние:',
      choices: ['new', 'used'],
      default: car.condition
    },
    {
      type: 'number',
      name: 'price',
      message: 'Цена ($):',
      default: car.price
    }
  ]);

  const updatedCar = catalog.updateCar(id, {
    manufacturer: answers.manufacturer,
    model: answers.model,
    year: answers.year,
    condition: answers.condition,
    price: answers.price
  });

  if (updatedCar) {
    console.log(`\n✅ Машина с ID ${id} обновлена!\n`);
  }
  
  await showMainMenu();
}

async function deleteCar(): Promise<void> {
  const { id } = await inquirer.prompt([
    {
      type: 'number',
      name: 'id',
      message: 'Введите ID машины для удаления:',
      validate: (input: number) => {
        if (isNaN(input)) return 'Введите число';
        if (input <= 0) return 'ID должен быть больше 0';
        return true;
      }
    }
  ]);

  const success = catalog.deleteCar(id);
  
  if (success) {
    console.log(`\n✅ Машина с ID ${id} удалена!\n`);
  } else {
    console.log(`\n❌ Машина с ID ${id} не найдена\n`);
  }
  
  await showMainMenu();
}

console.log('🚗 Добро пожаловать в каталог автомобилей!\n');
showMainMenu();