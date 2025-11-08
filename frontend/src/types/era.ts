export enum Era {
	PRE_ISLAMIC = 'pre_islamic',
	RASHIDUN = 'rashidun',
	UMAYYAD = 'umayyad',
	ABBASID = 'abbasid',
	AL_ANDALUS = 'al_andalus',
	OTTOMAN = 'ottoman',
	MODERN = 'modern',
}

// Для отображения в интерфейсе
export const ERA_LABELS: Record<Era, string> = {
	[Era.PRE_ISLAMIC]: 'Доисламский период',
	[Era.RASHIDUN]: 'Праведные халифы',
	[Era.UMAYYAD]: 'Омейяды',
	[Era.ABBASID]: 'Аббасиды',
	[Era.AL_ANDALUS]: 'Аль-Андалус',
	[Era.OTTOMAN]: 'Османы',
	[Era.MODERN]: 'Современность',
};
