--!strict
-- États d'un monstre du monde et transitions autorisées (ARCHITECTURE §2).
-- Table de données pure : MonsterWorld est le seul à appliquer les transitions.

export type State = "Wild" | "InCombat" | "Stunned" | "Asleep" | "Carried" | "Returning" | "Secured" | "Despawned"

local ALLOWED: { [State]: { [State]: boolean } } = {
	Wild = { InCombat = true, Despawned = true },
	-- InCombat/Stunned → Returning : la cible est perdue (trop loin, morte, partie, dans le lobby) ; le monstre
	-- regagne son point d'apparition. → Wild : abandon au minuteur (D5, sans suivi de cible). → Asleep : KO.
	InCombat = { Stunned = true, Asleep = true, Wild = true, Returning = true, Despawned = true },
	Stunned = { InCombat = true, Asleep = true, Wild = true, Returning = true, Despawned = true },
	-- Asleep → Returning : minuteur de sommeil écoulé au sol.
	Asleep = { Carried = true, Returning = true, Despawned = true },
	-- Carried → Asleep : lâcher, batte, mort, déconnexion. → Returning : réveil. → Secured : lobby.
	Carried = { Asleep = true, Returning = true, Secured = true, Despawned = true },
	Returning = { Wild = true, Despawned = true },
	Secured = {},
	Despawned = {},
}
