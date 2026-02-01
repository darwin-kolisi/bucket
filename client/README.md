# Bucket

A lightweight project management app I’m building to organize my personal projects.
Still a work in progress.

---

## What I’m working on now

- **Progress bar logic**

  1. Tasks move from **Todo** → **In Progress** → **Complete**, and the bar updates accordingly (0% → 50% → 100%).
  2. If a task card has subtasks, checking them off contributes to that card’s progress.
     - Dragging the card to _In Progress_ doesn’t change anything automatically, the subtasks drive progress.

- **Filtering**

  - Being able to filter tasks
  - Being able to filter projects

- **Project creation tweaks**  
  No status field when creating a project, the status should come from whether the tasks inside it are complete or not.

- **Search logic**  
  When searching for a project, results should appear directly on the projects page too.

- **UI issues**
  - Project kanban page doesn’t scroll.
  - Projects page footer gets pushed down if there are too many projects.
  - “Add new task” modal doesn’t allow a status code (but the projects page does).
  - The UI isn’t responsive at all yet, I’ll probably do this later. For mobile, I want to reuse my portfolio header.

---

## Questions I’m figuring out

- **Filtering logic:**  
  Tasks have priority codes right now (`high`, `medium`, `low`).  
  I’m torn between:
  - Keeping it simple → just edit the priority when needed, or
  - Making it smarter → use due dates + subtask completion to auto-adjust, and maybe send notifications. (If I go this route, I’ll borrow ideas from the campus safety app project and how my friend did real-time notifications.)

---

## Planned features

Stuff I want to add once the basics are stable:

- **User authentication** (probably Auth0, or maybe custom auth)
- **Database & persistence**
- **Advanced task features**: priorities, labels, attachments, comments, subtasks
- **Time tracking**
- **Notifications**
- **Reporting & analytics**

---
