import { Injectable } from '@angular/core';
import { Firestore, getDoc, doc, setDoc, updateDoc, getFirestore, arrayUnion, deleteDoc, DocumentReference, collection, query, getDocs, where, DocumentData, QuerySnapshot } from '@angular/fire/firestore';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword,updateEmail,updatePassword } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  [x: string]: any;

  private isModalOpen = new BehaviorSubject<boolean>(false);
  private editData = new BehaviorSubject<any>(null);

  isModalOpen$ = this.isModalOpen.asObservable();
  editData$ = this.editData.asObservable();


  currentUser:any;

  constructor(private fire: Firestore) { }

  // edit profile
  
  async updateUser(userId: string, userData: any): Promise<void> {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            await updateDoc(userRef, userData);

            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                if (userData.email) {
                    await updateEmail(user, userData.email);
                }

                if (userData.password) {
                    await updatePassword(user, userData.password);
                }
            }
        } else {
            throw new Error('User document does not exist');
        }
    } catch (error) {
        console.error('Error updating user data', error);
        throw error; 
    }
}


  // SignUp

async addUser(email: string, password: string, firstName: string, lastName: string, username: string, birthDate: number, shifts: any, isAdmin: boolean){
  try{
  const auth = getAuth();
  const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
  const userUid = userCredentials.user.uid;
  const userDoc = doc(this.fire, 'users', userUid);
  await setDoc(userDoc, {
    email,
    password,
    firstName,
    lastName,
    username,
    birthDate,
    shifts,
    isAdmin:false
  })
  }catch(err){
    console.log('err in creating new account');
  }
}

  // Login

async login(email: string, password: string){
try{
  const auth = getAuth();
 await signInWithEmailAndPassword(auth, email, password);
}catch(err){
console.log('Err logging into the app', err);
throw new Error('Login failed');
}
}

// get current user

async getCurrentUser(){
  const auth = getAuth();
  return new Observable((observer)=>{
    auth.onAuthStateChanged(async (user)=>{
     if(user){
      let userRef = doc(this.fire, 'users', user.uid);
      let userDoc = await getDoc(userRef);
      
      if(userDoc.exists()){
        const userData = {
          ...user,
          ...userDoc.data()
        }
        observer.next(userData);
      }
     }else{
      observer.next(null);
     }
    })
  })
}


// add-shift component logic

async addNewShift(shift: any){
const auth = getAuth();
return new Observable((observer)=>{
auth.onAuthStateChanged(async (user)=>{
    try{
     if(!user){
      console.log('No user is logged in')
     }else{
      const userDocRef = doc(this.fire, 'users', user.uid);
      await updateDoc(userDocRef, {
        shifts: arrayUnion(shift),
      })
     }
     observer.next();
    }catch(err){
    console.log('add shift err');
    }
})
})
}

// my-shifts logic

async getShiftsForCurrentUser() {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userDocRef = doc(this.fire, 'users', user.uid);
          const userDoc = getDoc(userDocRef);
          const userInfo = (await userDoc).data();
          if (userInfo && userInfo['shifts']) {
            observer.next(userInfo['shifts']);
          } else {
            console.log('User document or shifts not found');
            observer.next(null);
          }
        } else {
          console.log('User not logged in');
          observer.next(null);
        }
      } catch (err) {
        console.log('Error', err);
        observer.error(err);
      }
    });
  });
}


// Delete shifts from table and Firestore

async deleteShift(shift: any) {
  const auth = getAuth();
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userDocRef = doc(this.fire, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userInfo = userDoc.data();

      if (userInfo && userInfo['shifts']) {
        const updatedShifts = userInfo['shifts'].filter((s: any) => {
          return (
            s.dateShift !== shift.dateShift ||
            s.startTime !== shift.startTime ||
            s.endTime !== shift.endTime ||
            s.hourlyWage !== shift.hourlyWage ||
            s.shiftName !== shift.shiftName ||
            s.workPlace !== shift.workPlace ||
            s.Comments !== shift.Comments
          );
        });

        await updateDoc(userDocRef, {
          shifts: updatedShifts,
        });

        console.log('Shift deleted successfully');
      } else {
        console.log('User data or shifts not found');
      }
    } else {
      console.log('User not logged in');
    }
  });
}

// edit shifts

openModal(data: any) {
  this.isModalOpen.next(true);
  this.editData.next(data);
}

closeModal() {
  this.isModalOpen.next(false);
  this.editData.next(null);
}

async updateShift(userIndex: number, updatedShift: any): Promise<void> {
  const auth = getAuth();
  return new Promise<void>(async (resolve, reject) => {
    try {
      const user = await auth.currentUser;
      if (user) {
        const userDocRef = doc(this.fire, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userInfo = userDoc.data();

        if (userInfo && userInfo['shifts']) {
          const updatedShifts = [...userInfo['shifts']]; 
          updatedShifts[userIndex] = updatedShift; 
          
          await updateDoc(userDocRef, {
            shifts: updatedShifts,
          });

          console.log('Shift updated successfully');
          resolve();
        } else {
          console.log('User data or shifts not found');
          reject('User data or shifts not found');
        }
      } else {
        console.log('User not logged in');
        reject('User not logged in');
      }
    } catch (error) {
      console.error('Error updating shift:', error);
      reject(error);
    }
  });
}


async updateShiftInFirestore(existingShift: any, updatedShift: any): Promise<void> {
  const auth = getAuth();
  const user = await auth.currentUser;

  if (user) {
    const userDocRef = doc(this.fire, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userInfo = userDoc.data();

    if (userInfo && userInfo['shifts']) {
      const updatedShifts = userInfo['shifts'].map((s: any) => {
        if (
          s.dateShift === existingShift.dateShift &&
          s.startTime === existingShift.startTime &&
          s.endTime === existingShift.endTime &&
          s.hourlyWage === existingShift.hourlyWage &&
          s.shiftName === existingShift.shiftName &&
          s.workPlace === existingShift.workPlace &&
          s.Comments === existingShift.Comments
        ) {
          return updatedShift;
        } else {
          return s;
        }
      });

      await updateDoc(userDocRef, {
        shifts: updatedShifts,
      });

      console.log('Shift updated in Firestore');
    } else {
      console.log('User data or shifts not found');
      throw new Error('User data or shifts not found');
    }
  } else {
    console.log('User not logged in');
    throw new Error('User not logged in');
  }
}


// search by date

async getShiftsForRegularUser(sDate: any, eDate: any) {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userId = user.uid;
          const userDocRef = doc(this.fire, 'users', userId);
          const userDoc = getDoc(userDocRef);
          const userData = (await userDoc).data();

          if (sDate && eDate) {
            const startDate = new Date(sDate);
            const endDate = new Date(eDate);

            if (userData && userData['shifts']) {
              const filteredShifts = userData['shifts'].filter((shift: { dateShift: Date; }) => {
                const shiftDate = new Date(shift.dateShift);
 
                const shiftDateFormatted = shiftDate.toISOString().split('T')[0];
                const startDateFormatted = startDate.toISOString().split('T')[0];
                const endDateFormatted = endDate.toISOString().split('T')[0];
       
                return shiftDateFormatted >= startDateFormatted && shiftDateFormatted <= endDateFormatted;
              });

              observer.next(filteredShifts);
            } else {
              observer.next([]);
            }
          } else {
            observer.next(userData?.['shifts']);
          }
        } else {
          console.log('No user');
        }
      } catch (err) {
        console.log('Error:', err);
      }
    });
  });
}


//  search by name

async getShiftsByPlace(place: string) {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userId = user.uid;
          const userDocRef = doc(this.fire, 'users', userId);
          const userDoc = getDoc(userDocRef);
          const userData = (await userDoc).data();

          if (userData && userData['shifts']) {
            const filteredShifts = userData['shifts'].filter((shift: any) => {
              return shift.workPlace.toLowerCase() === place.toLowerCase();
            });

            observer.next(filteredShifts);
          } else {
            observer.next([]);
          }
        } else {
          console.log('No user');
        }
      } catch (err) {
        console.log('Error:', err);
      }
    });
  });
}

// forgot password 

async deleteUserByEmail(email: string): Promise<void> {
  const userDocRef = await this.getUserDocRefByEmail(email);

  if (userDocRef) {
    try {
      await deleteDoc(userDocRef);
      console.log('User document deleted successfully');
    } catch (error) {
      console.error('Error deleting user document:', error);
      throw error;
    }
  } else {
    alert('User account not found');
  }
}

private async getUserDocRefByEmail(email: string): Promise<DocumentReference<DocumentData> | null> {
  const emailIdentifier = query(collection(this.fire, 'users'), where('email', '==', email));
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(emailIdentifier);

  if (querySnapshot.docs.length > 0) {
    return querySnapshot.docs[0].ref as DocumentReference<DocumentData>;
  }

  return null;
}



//======================================= admin functions =================================

async getAllUsersAndShifts() {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user found');
        } else {
          const userUid = user.uid;
          const userDocRef = doc(this.fire, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const userInfo = (await userDoc).data() || {};

          if (userInfo['isAdmin']) {
            const usersCollection = collection(this.fire, 'users');
            const userQuery = query(usersCollection);
            const userDocs = await getDocs(userQuery);
            const usersInfo = (await userDocs).docs
            .filter((document)=> document.id !== userUid)
            .map((element) => {
              const userData = element.data();
              return { id: element.id, ...userData };
            });
            observer.next(usersInfo);
          } else {
            console.log('Current user is not admin!');
          }
        }
      } catch (err) {
        console.log("Error getting all users", err);
      }
    });
  });
}

// checks the user's role to login to different home pages
async getUserRole(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userRef = doc(this.fire, 'users', user.uid);

    try {
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
      
        return userData?.['isAdmin'] ? 'admin' : 'user'; 
      } else {
        return null; 
      }
    } catch (error) {
      console.error('Error retrieving user role:', error);
      throw error; 
    }
  } else {
    return null; 
  }
}

// edit user admin modal

async getUserByUidIfAdmin(uidUser:any){
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try{
        if(!user){
          console.log('No user is authenticated!')
        }else{
          const userDocRef = doc(this.fire, 'users', user.uid);
          const userDoc = getDoc(userDocRef);
          const userData = (await userDoc).data();

          if(!userData?.['isAdmin']){
            console.log('You are not an admin')
          }

          const userDocRecord = doc(this.fire, 'users', uidUser);
          const userDocument = getDoc(userDocRecord);
          const userDataRecord = (await userDocument).data();
          observer.next(userDataRecord)
        }
      }catch(err){
        console.log('no user', err)
      }
    })
  })
}

async updateProfileUserIfAdmin(uidUser:any, updatedData:any){
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try{
        if(!user){
          console.log('No user is authenticated!')
        }else{
          const userDocRef = doc(this.fire, 'users', user.uid);
          const userDoc = getDoc(userDocRef);
          const userData = (await userDoc).data();

          if(!userData?.['isAdmin']){
            console.log('You are not an admin')
          }

          const userDocRecord = doc(this.fire, 'users', uidUser);
          const updatedUserData = {...updatedData}

          updateDoc(userDocRecord, updatedUserData);
          observer.next(updatedUserData);
        }
      }catch(err){
        console.log('no user', err)
      }
    })
  })
}


// delete user admin

async deleteUser(userUidToDelete:any){
const auth = getAuth();
return new Observable((observer)=>{
auth.onAuthStateChanged(async (user)=>{
try{
  if(!user){
    console.log('No user is authenticated');
  }else{
const userDocRef = doc(this.fire, 'users', user.uid);
const userDoc = getDoc(userDocRef);
const userData = (await userDoc).data();

if(!userData?.['isAdmin']){
  console.log('Not admin user');
}else{
  const userDocToDelete = doc(this.fire, 'users', userUidToDelete);
  deleteDoc(userDocToDelete);
}

const usersCollection = collection(this.fire, 'users');
const allUsers = getDocs(usersCollection);
const remainingUsers =  (await allUsers).docs
.filter((el)=> el.id !== user.uid)
.map((el)=>({
uid:el.id,
...el.data()
}))
observer.next(remainingUsers);

  }
}catch(err){
  console.log('Error deleting user', err);
}
})
})
}

// delete shift of any user

async deleteShiftUserIfAdmin(userUid:any, shiftId:any){
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try{
        if(!user){
          console.log('No user is authenticated!')
          return;
        }

        const userDocRef = doc(this.fire, 'users', user.uid);
        const userDoc = getDoc(userDocRef);
        const userData = (await userDoc).data();

        if(!userData?.['isAdmin']){
          console.log('You are not an admin!')
        }

        const userRecordRef = doc(this.fire, 'users', userUid);
        const userRecord = getDoc(userRecordRef);
        const userDataRecord = (await userRecord).data();
        if(userDataRecord?.['shifts']){
          const shiftIndex = userDataRecord['shifts'].findIndex((element:any) => element.id === shiftId);
          userDataRecord['shifts'].splice(shiftIndex, 1);
        }

        updateDoc(userRecordRef, {
          shifts: userDataRecord?.['shifts']
        })

        const usersCollection = collection(this.fire, 'users');
        const userQuery = query(usersCollection);
        const userDocs = getDocs(userQuery);
        const usersInfo = (await userDocs).docs
          .filter((document) => document.id !== user.uid)
          .map((document) => ({
            ...document.data(),
            uid: document.id
          }))

        observer.next(usersInfo);
      }catch(err){
        console.log('err', err)
      }
    })
  })
}

// edit shift of any user

async getShiftByIdIfAdmin(shiftId: any) {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user is authenticated!');
          return;
        }

        const userDocRef = doc(this.fire, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData?.['isAdmin']) {
          console.log('You are not an admin!');
          return;
        }

        const usersCollection = collection(this.fire, 'users');
        const userQuery = query(usersCollection);
        const userDocs = await getDocs(userQuery);
        const usersInfo: { shifts?: any[]; uid: string; lastName?: string }[] = userDocs.docs
          .filter((document) => document.id !== user.uid)
          .map((document) => ({
            ...document.data(),
            uid: document.id,
          }));

        for (const regularUser of usersInfo) {
          if (regularUser.shifts && Array.isArray(regularUser.shifts)) {
            const shiftToFind = regularUser.shifts.find((shift: any) => shift.id === shiftId);
            if (shiftToFind) {
              if (regularUser.lastName) {
                observer.next({ lastName: regularUser.lastName, shiftData: shiftToFind });
              } else {
                observer.next({ lastName: 'Default', shiftData: shiftToFind });
              }
              return;
            }
          }
        }
        observer.next({ lastName: 'null', shiftData: null });

      } catch (err) {
        console.log('err', err);
      }
    });
  });
}

async updateShiftIfAdmin(shiftId: any, updatedData: any) {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user is authenticated!');
          return;
        }

        const userDocRef = doc(this.fire, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData || !userData['isAdmin']) {
          console.log('You are not an admin!');
          return;
        }

        const usersCollection = collection(this.fire, 'users');
        const userQuery = query(usersCollection);
        const userDocs = await getDocs(userQuery);
        const usersInfo: Array<{ uid: string, shifts?: any[] }> = userDocs.docs
          .filter((document) => document.id !== user.uid)
          .map((document) => ({
            ...document.data(),
            uid: document.id,
          }));

        for (const regularUser of usersInfo) {
          if (regularUser.shifts) {
            const shiftToFindIndex = regularUser.shifts.findIndex(
              (shift: any) => shift.id === shiftId
            );

            if (shiftToFindIndex !== -1) {
              regularUser.shifts[shiftToFindIndex] = {
                ...regularUser.shifts[shiftToFindIndex],
                ...updatedData
              };
              // console.log(regularUser.shifts[shiftToFindIndex]);

              const userDocRef = doc(this.fire, 'users', regularUser.uid);
              await updateDoc(userDocRef, {
                shifts: regularUser.shifts, 
              });
              console.log('Firestore updated for shifts');
              // await updateDoc(userDocRef, {
              //   lastName: updatedData.lastName,
              // });
              // console.log('Firestore updated for lastName');

              observer.next(usersInfo);
            }
          }
        }
      } catch (err) {
        console.log('Error:', err);
      }
    });
  });
} 





// search by last name
getShiftsByLastName(lastNameFilter: string): Observable<any[]> {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user is authenticated!');
          observer.error('No user is authenticated');
          return;
        }

        const userDocRef = doc(this.fire, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData || !userData['isAdmin']) {
          console.log('You are not an admin!');
          observer.error('You are not an admin');
          return;
        }

        const usersCollection = collection(this.fire, 'users');
        const userDocs = await getDocs(usersCollection);

        const filteredShifts: any[] = [];

        userDocs.forEach((document) => {
          if (document.id !== user.uid) {
            const userData = document.data();
            if (userData && userData['lastName'] === lastNameFilter && Array.isArray(userData['shifts'])) {
              filteredShifts.push({
                lastName: userData['lastName'],
                shifts: userData['shifts'],
              });
            }
          }
        });

        observer.next(filteredShifts); 
        observer.complete();
      } catch (err) {
        console.error('Error:', err);
        observer.error(err); 
      }
    });
  });
}


// search by shift place

getShiftsByShiftPlace(shiftPlaceFilter: string): Observable<any[]> {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user is authenticated!');
          observer.error('No user is authenticated');
          return;
        }

        const userDocRef = doc(this.fire, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData || !userData['isAdmin']) {
          console.log('You are not an admin!');
          observer.error('You are not an admin');
          return;
        }

        const usersCollection = collection(this.fire, 'users');
        const userDocs = await getDocs(usersCollection);

        const filteredShifts: any[] = [];

        userDocs.forEach((document) => {
          if (document.id !== user.uid) {
            const userData = document.data();
            if (Array.isArray(userData['shifts'])) {
              const matchingShifts = userData['shifts'].filter((shift) => shift.workPlace === shiftPlaceFilter);
              if (matchingShifts.length > 0) {
                filteredShifts.push({
                  lastName: userData['lastName'],
                  shifts: matchingShifts,
                });
              }
            }
          }
        });

        observer.next(filteredShifts);
        observer.complete();
      } catch (err) {
        console.error('Error:', err);
        observer.error(err);
      }
    });
  });
}


// Search by date


getShiftsByDate(startDateFilter: string, endDateFilter: string): Observable<any[]> {
  const auth = getAuth();
  return new Observable((observer) => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user is authenticated!');
          return;
        }

        const userDocRef = doc(this.fire, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData || !userData['isAdmin']) {
          console.log('You are not an admin!');
          return;
        }

        const usersCollection = collection(this.fire, 'users');
        const userDocs = await getDocs(usersCollection);

        const filteredShifts: any[] = [];

        userDocs.forEach((userDoc) => {
          const userData = userDoc.data();
          const userId = userDoc.id;
        
          if (userId !== user.uid) {
            if (Array.isArray(userData['shifts'])) {
              const matchingShifts = userData['shifts'].filter((shift: any) => {
                const shiftDate = new Date(shift.dateShift);
                const shiftDateFormatted = shiftDate.toISOString().split('T')[0];
                const startDate = new Date(startDateFilter);
                const startDateFormatted = startDate.toISOString().split('T')[0];
                const endDate = new Date(endDateFilter);
                const endDateFormatted = endDate.toISOString().split('T')[0]; 
        
                if (shiftDateFormatted >= startDateFormatted && shiftDateFormatted <= endDateFormatted) {
                  return true;
                }
                return false;
              });
        
              if (matchingShifts.length > 0) {
                const formattedShifts = matchingShifts.map((shift: any) => ({
                  ...shift,
                  ...this['shiftDateFormatted']
                }));
                filteredShifts.push({
                  lastName: userData['lastName'],
                  shifts: formattedShifts,
                });
              }
            }
          }
        });
        observer.next(filteredShifts);
      } catch (err) {
        console.error('Error:', err);
      }
    });
  });
}

// shift name unique - regular user

async isShiftNameUnique(userId: string, shiftName: string): Promise<boolean> {
  try {
    const userRef = doc(this.fire, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData?.['shifts']) {
        return !userData['shifts'].some((shift: any) => shift.shiftName === shiftName);
      }
    }
    return true; 
  } catch (error) {
    console.error('Error checking shift name uniqueness:', error);
    return false; 
  }
}


// user of the month


async findUserWithMostShifts() {
  const auth = getAuth();
  const usersCollection = collection(this.fire, 'users');
  const userDocs = await getDocs(usersCollection);

  let mostShiftsUser: any = null;
  let mostShiftsCount = 0;

  for (const doc of userDocs.docs) {
    const userData = doc.data();
    if (
      userData &&
      !userData['isAdmin'] &&  
      userData['shifts'] &&
      Array.isArray(userData['shifts'])
    ) {
      const numShifts = userData['shifts'].length;
      if (numShifts > mostShiftsCount) {
        mostShiftsCount = numShifts;
        mostShiftsUser = userData;
      }
    }
  }

  return mostShiftsUser;
}

// most profitable user


async findUserWithMostProfitableShift() {
  const auth = getAuth();
  const usersCollection = collection(this.fire, 'users');
  const userDocs = await getDocs(usersCollection);

  let mostProfitableUser: any = null;
  let highestProfit: number = 0;

  for (const doc of userDocs.docs) {
    const userData = doc.data();
    if (
      userData &&
      !userData['isAdmin'] &&  
      userData['shifts'] &&
      Array.isArray(userData['shifts'])
    ) {
      
      const shifts = userData['shifts'];
      for (const shift of shifts) {
        const startTime = new Date('1970-01-01T' + shift.startTime);
        const endTime = new Date('1970-01-01T' + shift.endTime);

        const timeDiff = endTime.getTime() - startTime.getTime();

        const hoursWorked = timeDiff / (1000 * 3600);

        const totalProfit = parseFloat((hoursWorked * shift.hourlyWage).toFixed(2));


        if (totalProfit > highestProfit) {
          highestProfit = totalProfit;
          mostProfitableUser = userData;
        }
      }
    }
  }

  return mostProfitableUser;
}

// most profitable month for a regular user

async findMostProfitableMonthForUser(uid: string) {
  const userDocRef = doc(this.fire, 'users', uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const userData = docSnap.data();

    if (
      userData &&
      !userData['isAdmin'] && 
      userData['shifts'] &&
      Array.isArray(userData['shifts'])
    ) {
      const shifts = userData['shifts'];
      const monthlyProfit: { [key: string]: number } = {};

      for (const shift of shifts) {
        if (shift.dateShift) { 
          const dateShift = new Date(shift.dateShift);
          const startTime = new Date('1970-01-01T' + shift.startTime);
        const endTime = new Date('1970-01-01T' + shift.endTime);

        const timeDiff = endTime.getTime() - startTime.getTime();

        const hoursWorked = timeDiff / (1000 * 3600);

        const totalProfit = parseFloat((hoursWorked * shift.hourlyWage).toFixed(2));

          console.log('Shift Date:', dateShift);

          const monthKey = dateShift.toLocaleString('en-US', { month: 'long' });

          console.log('Month Key:', monthKey);

          if (!monthlyProfit[monthKey]) {
            monthlyProfit[monthKey] = 0;
          }

          monthlyProfit[monthKey] += totalProfit;
        }
      }

      let mostProfitableMonth: string | null = null;
      let highestTotalProfit: number = 0;

      for (const monthKey in monthlyProfit) {
        if (monthlyProfit[monthKey] > highestTotalProfit) {
          highestTotalProfit = monthlyProfit[monthKey];
          mostProfitableMonth = monthKey;
        }
      }

      console.log('Most Profitable Month:', mostProfitableMonth);

      return mostProfitableMonth;
    }
  }

  return null; 
}

// shift name unique - admin

async getAllOtherShifts(shiftName: string, adminUserId: string): Promise<any[]> {
  const shiftsCollection = collection(this.fire, 'users');
  const allShifts: any[] = [];

  try {
    const querySnapshot = await getDocs(shiftsCollection);
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;
      const isAdmin = userData?.['isAdmin'] || false;

      if (!isAdmin && userId !== adminUserId && userData?.['shifts']) {
        allShifts.push(...userData['shifts']);
      }
    });

    return allShifts;
  } catch (error) {
    console.error('Error fetching shifts of other users:', error);
    return [];
  }
}



}
    







