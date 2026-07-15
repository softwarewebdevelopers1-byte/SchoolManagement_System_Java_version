export const STREAMS = ['North', 'South', 'East', 'West'];
export const FORMS = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
export const DEPARTMENTS = ['Languages', 'Sciences', 'Mathematics', 'Humanities', 'Technical & Applied', 'Creative Arts'];

export const CLASSES = [];
FORMS.forEach((form) => {
  STREAMS.forEach((stream) => {
    CLASSES.push({
      id: `${form.replace('Form ', 'F')}-${stream}`,
      form,
      stream,
      name: `${form} ${stream}`,
      capacity: 45,
      classTeacherId: null, // populated in teachers.js once staff are generated
    });
  });
});
