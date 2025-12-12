session id: unique identifier for one game match.
genesis hash: the initial hash which is the hash of the session id.
checkpoint: like a block of events instead of hashing all checkpoints, we just couple them into checkpoints in order to minimize space on the blockchain.
Hash: the cryptographic signature of a word, combination of letters or anything.
Events: the ocassions that took place during the game play.



GAMEPLAY;
1. Telementry captures event 
2. Observer gets notified 
3. EventBuilder convert it to KEY_PRESS event
4. It is been added to a chain: new hash = hash(old hash + event)
5. Some reminant event are stored in the PendingEvents
6. When 150ms passes, checkpoint is created

