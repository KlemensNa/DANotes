import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, collectionData, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Note } from '../interfaces/note.interface';


@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  // items$;
  // items;

  unsubTrash;                      // deklariert als Variable, ist aber durch onSnapshot eine Funktion geworden
  unsubNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {                      //Snapshot gibt jede Veränderug zurück
      this.trashNotes = [];
      list.forEach(element => {                                           //komplette collection
        this.trashNotes.push(this.setNoteObject(element.data(), element.id))        
      });
      console.log(this.trashNotes)    
    })

  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {                          //Snapshot gibt jede Veränderug zurück
      this.normalNotes = [];
      list.forEach(element => {                                                 //komplette collection
        this.normalNotes.push(this.setNoteObject(element.data(), element.id))  
      });
      console.log(this.normalNotes)    
    })
  }

  setNoteObject(obj: any, id: string): Note {          //obj ist einfach das Element mit data() und id ist schon klar
    return {
      id: id,
      type: obj.type || "",
      titel: obj.titel || "note",
      content: obj.content || "",
      marked: obj.marked || false
    }

    // this.items$ = collectionData(this.getNotesRef());              //genau wie oben, nur etwas umfänglicher
    // this.items = this.items$.subscribe((list) => {                 //mit observable und extra unsubscribe
    //   list.forEach(element => {
    //     console.log(element)
    //   });
    // })

  }

  ngOnDestroy() {
    this.unsubNotes();               // unsubcriben durch aufruf der Variablen/ Funktion
    this.unsubTrash();
    // this.items.unsubscribe();
  }

  getTrashRef() {
    return collection(this.firestore, 'trash')    //Zugriff auf unseren firestore, und dort die id "trash"
  }

  getNotesRef() {
    return collection(this.firestore, 'notes')  //Zugriff auf unseren firestore, und dort die id "notes"
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }

  // const itemCollection = collection(this.firestore, 'items');
}
