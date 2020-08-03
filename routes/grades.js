import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let grade = req.body;

    if (!grade.student || !grade.subject || !grade.type || grade.value == null) {
      throw new Error('Student, Subject, Type e Value são obrigatórios.');
    }
    const data = JSON.parse(await readFile(global.fileName));

    grade = { 
      id: data.nextId,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date()
    };
    data.nextId++;

    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);

    global.logger.info(`POST /grade - ${JSON.stringify(grade)}`);
  } catch (error) {
    next(error);
  }
});

router.get('/gradeSum', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const {student, subject} = req.query;

    const grade = data.grades.filter(
      (grade) => grade.student === student && grade.subject === subject
    );

    const gradeSum = grade.reduce((acc, cur) => {
      return acc + cur.value;
    }, 0);
    res.send(`A soma total do(a) <b>${student}</b> da disciplina <b>${subject}</b> é de: <b>${gradeSum}</b>`);
    global.logger.info(`GET /gradeSum - ${student} (${subject}) = ${gradeSum}`);
  } catch (error) {
    next(error);
  }
});


router.get('/gradeAvg', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const {type, subject} = req.query;

    const grade = data.grades.filter(
      (grade) => grade.type === type && grade.subject === subject
    );

    const gradeAvg = grade.reduce((acc, cur) => {
      return acc + cur.value;
    }, 0) / grade.length;
    res.send(`A <b>média</b> da disciplina <b>${subject}</b> do tipo <b>${type}</b> é de: <b>${gradeAvg.toFixed(2)}</b>`);
    global.logger.info(`GET /gradeAvg - ${subject} (${type}) = ${gradeAvg.toFixed(2)}`);
  } catch (error) {
    next(error);
  }
});

router.get('/rankingGrades', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const {type, subject} = req.query;

    const grade = data.grades.filter(
      (grade) => grade.type === type && grade.subject === subject
    ).sort((a,b) => b.value - a.value).slice(0, 3);

   
    res.send(grade);
    global.logger.info(`GET /gradeAvg - ${subject} (${type}) = ${grade}`);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const grade = req.body;

    if (!grade.student || !grade.subject || !grade.type || grade.value == null) {
      throw new Error('Student, Subject, Type e Value são obrigatórios.');
    }

    const data = JSON.parse(await readFile(global.fileName));
    
    const index = data.grades.findIndex((a) => a.id === parseInt(req.params.id));

    if(index === -1){
      throw new Error('Registro não encontrado');
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;
    data.grades[index].timestamp = new Date();

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.send(grade);
    global.logger.info(`PUT /grade - ${JSON.stringify(grade)}`);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
    global.logger.info(`DELETE /grade/:id - ${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const grade = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );
    res.send(grade);
    global.logger.info('GET /grade/:id');
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;