// src/useTasks.js
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../firebaseConfig';  // Import the initialized Firebase app

// Initialize Firestore
const db = getFirestore(app);

const useTasks = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const tasksCollectionRef = collection(db, 'tasks');  // Pass the Firestore instance (db)
      const querySnapshot = await getDocs(tasksCollectionRef);
      const tasksArray = querySnapshot.docs.map((doc) => doc.data());
      setTasks(tasksArray);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return tasks;
};

export default useTasks;
