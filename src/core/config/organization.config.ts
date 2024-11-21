export const plansLimitations = {
	base: {
		assistants: 5,
		phones: 5,
		calls: 1, // 5 calls at the same time
		knowledgeMB: 1024, // 1GB
	},
	pro: {
		assistants: 10,
		phones: 10,
		calls: 5, // 5 calls at the same time
		knowledgeMB: 1024 * 5, // 5GB
	},
	enterprise: {
		assistants: 15,
		phones: 15,
		calls: 10, // 5 calls at the same time
		knowledgeMB: 1024 * 10, // 10GB
	}
}