# Source numbering and discovery

Each connected folder has a separate persistent sequence starting at `0001`. The app
renames every provider video to `0001.mp4`, `0002.mp4`, and up using stable
Drive/Dropbox IDs. Only the number is used as the title (`0001`); filenames keep
the media extension, such as `.mov`. No descriptive title is appended. Initial assignment is sorted
by filename/ID; subsequent discoveries take the next number without renumbering the
old library. Removed videos and cancelled uploads do not free their numbers.

Numbers are reserved durably before remote changes. Existing numeric prefixes are
adopted on an initial connection/reconnect without a registry; duplicate prefixes receive a free number.
Once a source has a registry, every new outside identity takes the next number,
even if its previous filename was already numeric (for example `9999.mp4`). Existing notes,
explicit ratings, labels and practice history remain attached to stable IDs.
Existing descriptive titles are replaced with the allocated number, including
previous `0001 — Original title` names. Titles from saved registries are normalized
even offline; refreshing each connected source applies actual cloud/phone renames.
Source video details show a read-only number; descriptions belong in labels/notes. Provider
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
number. Old jobs without numbers reserve one on resume. Build11 jobs retain their
allocated number. Both rename the confirmed file by ID to the number-only final
name, without changing any saved session/path. Legacy descriptive staging paths
remain recognizable and protected during discovery. Dropbox conflicts fail rather
than overwrite. Numbering can contain gaps. Separate unsynced phones can reserve the
same next number; there is no centralized multi-device sequence lock in this preview.
Manual metadata snapshots include the numbering registry, not upload credentials.

Source names containing only Salsa or Bachata identify that source's daily dance
slot. Otherwise its configured default style is used. Daily Picks chooses from the
source's actual file membership; editing a video's style does not move its file or
change its upload destination. A new imported video must still explicitly select
its desired folder after preview.

Dropbox uses a job-unique temporary filename during transfer. After confirmation, the app renames that stable file ID to its numbered name. A conflicting numbered name is reported, never treated as a successful upload of another file. Discovery leaves pending jobs at their saved paths until registration, so lost acknowledgements remain recoverable.

Only job-unique staging names or confirmed stable file IDs may claim an unfinished upload reservation. An unrelated numeric filename always receives a fresh allocation. Before finalization, the app durably rechecks the confirmed file ID against the registry and allocates a fresh number if a legacy conflict exists. Completed Dropbox retries query the confirmed file ID even after the temporary path has been renamed; a missing or mismatched ID never starts another upload.
