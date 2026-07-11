import type { Student } from '@/types'

const firstNamesM = ['Brian', 'Kevin', 'Dennis', 'Collins', 'Felix', 'Victor', 'Emmanuel', 'Ian', 'Alex', 'Samuel', 'Josiah', 'Mark']
const firstNamesF = ['Faith', 'Grace', 'Joy', 'Purity', 'Mercy', 'Diana', 'Sharon', 'Winnie', 'Lynn', 'Esther', 'Ann', 'Ruth']
const lastNames = ['Mwangi', 'Otieno', 'Kamau', 'Wanjiru', 'Njoroge', 'Achieng', 'Kiplagat', 'Cheruiyot', 'Mutua', 'Wafula', 'Karanja', 'Ochieng']
const classNames = ['Form 1', 'Form 2', 'Form 3', 'Form 4']
const streams = ['East', 'West', 'North', 'South']

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(42)

export const students: Student[] = Array.from({ length: 48 }, (_, i) => {
  const isMale = rand() > 0.48
  const first = isMale ? firstNamesM[i % firstNamesM.length] : firstNamesF[i % firstNamesF.length]
  const last = lastNames[(i * 3) % lastNames.length]
  const className = classNames[i % classNames.length]
  const stream = streams[Math.floor(i / 4) % streams.length]
  const statusRoll = rand()
  return {
    id: `stu-${1000 + i}`,
    admissionNo: `EDX/${2023 + (i % 3)}/${String(1000 + i).padStart(4, '0')}`,
    name: `${first} ${last}`,
    className,
    stream,
    gender: isMale ? 'Male' : 'Female',
    guardian: `${lastNames[(i + 5) % lastNames.length]} Family`,
    status: statusRoll > 0.95 ? 'Suspended' : statusRoll > 0.9 ? 'Transferred' : 'Active',
    meanScore: Math.round((45 + rand() * 50) * 10) / 10,
    attendance: Math.round(78 + rand() * 22),
  }
})
