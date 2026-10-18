# Source numbering and discovery

Each connected folder has a separate persistent sequence starting at0001. The app
renames provider files to `0001 — Original title.mp4` using stable Drive/Dropbox IDs.
It retains the extension and original descriptive name. Initial assignment is sorted
by filename/ID; subsequent discoveries take the next number without renumbering the
old library. Removed videos and cancelled uploads do not free their numbers.

Numbers are reserved durably before remote changes. Existing numeric prefixes are
adopted on reconnect; duplicate prefixes receive a free number. Existing notes,
explicit ratings, practice history and saved titles remain attached to stable IDs.
Local library titles gain a number but custom descriptions are preserved. Provider
rename calls change only the name in the selected parent, with no content upload,
overwrite or ownership transfer. A read-only account still gets library numbering,
with a source warning explaining why its actual cloud filenames could not change.

App-owned phone copies use the numbered filename in an isolated video-identity
directory. The app copies first, commits the new reference, then removes the old
copy. Failure leaves the original. A pre-existing destination must match size and
SHA256 before reuse. Gallery/Files originals outside BailaCue are untouched. Browser
IndexedDB entries have stable keys; they are not a phone filesystem.

Refresh scans a complete paginated folder listing before deciding a file is missing.
Discovery runs on open/resume, every five minutes while active, and manually in
Storage. This finds files added directly through Drive, Dropbox or another app.
No background-while-closed or instant notification guarantee is made.

New uploads first refresh the selected folder and reserve its next number. A retry
keeps the original job ID, account, source, folder, provider session/path and reserved
number. Old jobs from build9 reserve a number on resume and rename the confirmed
file by ID if its old upload-session name differs. Dropbox conflicts fail rather
than overwrite. Numbering can contain gaps. Separate unsynced phones can reserve the
same next number; there is no centralized multi-device sequence lock in this preview.
Manual metadata snapshots include the numbering registry, not upload credentials.

Source names containing only Salsa or Bachata identify that source's daily dance
slot. Otherwise its configured default style is used. Daily Picks chooses from the
source's actual file membership; editing a video's style does not move its file or
change its upload destination. A new imported video must still explicitly select
its desired folder after preview.

Dropbox uses a job-unique temporary filename during transfer. After confirmation, the app renames that stable file ID to its numbered name. A conflicting numbered name is reported, never treated as a successful upload of another file. Discovery leaves pending jobs at their saved paths until registration, so lost acknowledgements remain recoverable.
