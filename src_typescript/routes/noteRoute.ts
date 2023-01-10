import { Router} from "express";

import NoteController from "../controllers/noteController";

// ######### /calendar/{calendar_id}/note route ######### //
// >> user jwt checked

const router = Router({ mergeParams: true });

//calendar note routes
router.post("/", NoteController.createNote); //create note

router.get("/", NoteController.getAllNotesInfo); //get all notes
router.get("/:note_id", NoteController.getNoteInfo); //get note information

router.patch("/:note_id", NoteController.editNote); //edit note

router.delete("/:note_id", NoteController.deleteNote); //delete note

export default router;