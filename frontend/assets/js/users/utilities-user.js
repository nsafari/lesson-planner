// وضعیت و رنگ نمره کیفی
function getQualitativeStatus(qual) {
    switch (qual) {
        case 'ممتاز':
            return { color: 'green', emoji: '🟢', score: 5 }
            break;
        case 'عالی':
            return { color: 'blue', emoji: '🔵', score: 4 }
            break;
        case 'خوب':
            return { color: 'yellow', emoji: '🟡', score: 3 }
            break;
        case 'متوسط':
            return { color: 'orange', emoji: '🟠', score: 2 }
            break;
        case 'سعی بیشتر':
            return { color: 'red', emoji: '🔴', score: 1 }
            break;
        default:
            return { color: 'gray', emoji: '⚪', score: 0 }
            break;
    }
}

// وضعیت و رنگ نمره کمی (برای نمودار کمی)
function getScoreStatus(score) {
    if (score >= 18) return { color: 'green', emoji: '🟢', status: 'قبول شده است' };
    if (score >= 16) return { color: 'blue', emoji: '🔵', status: 'قبول شده است' };
    if (score >= 13) return { color: 'yellow', emoji: '🟡', status: 'قبول شده است' };
    return { color: 'red', emoji: '🔴', status: 'مردود' };
}

export const utilities_user = { getQualitativeStatus, getScoreStatus }
