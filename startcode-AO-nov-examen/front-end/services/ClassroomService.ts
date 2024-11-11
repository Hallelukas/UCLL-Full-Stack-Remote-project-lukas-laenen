const getToken = (): string => {
    const loggedInUserString = sessionStorage.getItem('loggedInUser');
    return loggedInUserString ? JSON.parse(loggedInUserString).token : '';
  };

const getClassroomByName = (name: string) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL+`/classrooms/${name}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        }
    })
};

const addClassroom = (name: string) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL+`/classrooms/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name })
    });
};

const ClassroomService = {
    addClassroom,
    getClassroomByName,
};
  

export default ClassroomService;