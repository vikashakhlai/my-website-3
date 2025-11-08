// src/utils/distractorUtils.ts
import { shuffleArray } from './shuffleArray';

/**
 * Генерирует массив опций для multiple choice:
 * 1. Правильный ответ
 * 2. 3 случайных отвлекающих из пула
 */
export const generateMultipleChoiceOptions = (
	correctAnswer: string,
	distractors: string[]
): string[] => {
	if (distractors.length < 3) {
		console.warn('Недостаточно отвлекающих вариантов для генерации.');
		return [correctAnswer];
	}

	// Выбираем 3 случайных отвлекающих
	const shuffledDistractors = shuffleArray([...distractors]);
	const selectedDistractors = shuffledDistractors.slice(0, 3);

	// Собираем все варианты + перемешиваем
	const allOptions = [...selectedDistractors, correctAnswer];
	return shuffleArray(allOptions);
};
