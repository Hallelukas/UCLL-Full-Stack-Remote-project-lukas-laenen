const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem('loggedInUser');
  return loggedInUserString ? JSON.parse(loggedInUserString).token : '';
};

const getAllTeachers = () => {
  return fetch(process.env.NEXT_PUBLIC_API_URL+'/teachers', {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    }
} )
};

const updateLearningPath = (teacherId: number, learningPath: string) => {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${teacherId}/learningPath`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({learningPath}),
  });
};

const TeacherService = {
  getAllTeachers,
  updateLearningPath,
};

export default TeacherService;
