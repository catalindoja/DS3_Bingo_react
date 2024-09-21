import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Function to fetch 25 random tasks from Firestore
export const getRandomTasks = async () => {
  const db = getFirestore();
  const tasksCollection = collection(db, 'tasks');

  const querySnapshot = await getDocs(tasksCollection);
  const allTasks = querySnapshot.docs.map(doc => doc.data());

  // Shuffle the tasks array and select 25 random tasks
  const shuffledTasks = allTasks.sort(() => 0.5 - Math.random());
  return shuffledTasks.slice(0, 25).map(task => ({
    ...task,
    completedBy: null, // Initialize task as not completed
    color: null // Initialize with no color
  }));
};
