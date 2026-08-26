# Product Domain Map

Cet index référence les entités du domaine métier de MyEvents (Réf: §73).
*Aucune entité n'est créée dans le code pendant la session 04.6.*

| Object | Source Section | Priority | Dependencies | Future Session | Implemented/Planned |
|---|---|---|---|---|---|
| User | §73 | P0 | | 05 | Planned |
| Workspace | §73 | P0 | User | 05 | Planned |
| Event | §73 | P0 | Workspace | 05 | Planned |
| EventMember | §73 | P0 | Event, User | 05 | Planned |
| Invitation | §73 | P0 | Event | 07 | Planned |
| InvitationVersion | §73 | P0 | Invitation | 07 | Planned |
| Template | §73 | P0 | | 07 | Planned |
| Theme | §73 | P0 | | 07 | Planned |
| Section | §73 | P0 | InvitationVersion | 07 | Planned |
| Component | §73 | P0 | Section | 07 | Planned |
| Guest | §73 | P0 | Event | 26 | Planned |
| GuestGroup | §73 | P0 | Guest | 26 | Planned |
| RSVPForm | §73 | P0 | Event | 27 | Planned |
| RSVPField | §73 | P0 | RSVPForm | 27 | Planned |
| RSVPSubmission | §73 | P0 | RSVPForm, GuestGroup | 27 | Planned |
| Location | §73 | P0 | Event | 16 | Planned |
| ScheduleItem | §73 | P0 | Event | 16 | Planned |
| Task | §73 | P1/P2 | Event | | Planned |
| BudgetItem | §73 | P1/P2 | Event | | Planned |
| Vendor | §73 | P1/P2 | Event | | Planned |
| MediaSpace | §73 | P0 | Event | 35 | Planned |
| MediaAsset | §73 | P0 | MediaSpace | 35 | Planned |
| AudioMessage | §73 | P0 | MediaSpace | 36 | Planned |
| QRCode | §73 | P0 | Event | 34 | Planned |
| Collaborator | §73 | P1 | Workspace | | Planned |
| Product | §73 | P0 | | 06 | Planned |
| Pack | §73 | P0 | Product | 06 | Planned |
| ProductOption | §73 | P0 | Product | 06 | Planned |
| PrintProduct | §73 | P0 | | 50 | Planned |
| Material | §73 | P0 | PrintProduct | 51 | Planned |
| Order | §73 | P0 | Event, User | 44 | Planned |
| OrderItem | §73 | P0 | Order, Product | 44 | Planned |
| Payment | §73 | P0 | Order | 45 | Planned |
| StorageQuota | §73 | P0 | Workspace/Event | 35 | Planned |
| StorageAddon | §73 | P0 | Workspace/Event | 46 | Planned |
| Notification | §73 | P1/P2 | User | | Planned |
| AuditLog | §73 | P1/P2 | Workspace | | Planned |
