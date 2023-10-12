import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
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
    })
  }

  async deleteNotes(colId: string, docId: string){
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => {console.error(err)}
    )
  }

  async updateNote(note: Note) {                  //get Notes wenn click Save for closeEdit() or changeMarkStatus() in note.component.js/html
    if (note.id) {                                
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);    // returns "notes" or "trash" and makes a Ref for this doc
      await updateDoc(docRef, this.getCleanJSON(note)).catch(                     // update(docToChange, JSON(allNoteItmesBut "ID"))
        (err) => { console.error(err) }
      ).then()
    }
  }

  getCleanJSON(note: Note): {} {      //have to return because the update includes not the ID
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  getColIdFromNote(note: Note) {      //wenn man collection auch note genannt hätte, hätte man sich diese Funktion sparen können
    if (note.type == "note") {
      return "notes"
    } else {
      return "trash"
    }
  }

  async addNote(item: Note, colId: string) {                                                 //hinzufügen von Item/JSON zu collection  
    await addDoc(this.getRef(colId), item).catch(                         // gib collection und item rein
      (err) => { console.error(err) }
    ).then();                                                               //catch error oder gib docref aus
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {                          //Snapshot gibt jede Veränderug zurück
      this.normalNotes = [];
      list.forEach(element => {                                               //komplette collection
        this.normalNotes.push(this.setNoteObject(element.data(), element.id))
      });

    })
  }

  setNoteObject(obj: any, id: string): Note {          //obj ist einfach das Element mit data() und id ist schon klar
    return {
      id: id,
      type: obj.type || "",
      title: obj.title || "note",
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

  getRef(colId: string){
    return collection(this.firestore, colId)
  }

  getNotesRef() {
    return collection(this.firestore, 'notes')  //Zugriff auf unseren firestore, und dort die id "notes"
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }

  // const itemCollection = collection(this.firestore, 'items');
}
