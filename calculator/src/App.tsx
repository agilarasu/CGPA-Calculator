'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, GraduationCap, Book, Award } from 'lucide-react'

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState<Array<{ courses: Array<{ name: string; credits: number; grade: number }>, sgpa: number }>>([])

  const calculateSGPA = (courses: Array<{ credits: number; grade: number }>) => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
    const totalGradePoints = courses.reduce((sum, course) => sum + course.credits * course.grade, 0)
    return totalCredits > 0 ? totalGradePoints / totalCredits : 0
  }

  const calculateCGPA = () => {
    const totalCredits = semesters.reduce((sum, semester) => sum + semester.courses.reduce((sum, course) => sum + course.credits, 0), 0)
    const totalGradePoints = semesters.reduce((sum, semester) => sum + semester.courses.reduce((sum, course) => sum + course.credits * course.grade, 0), 0)
    return totalCredits > 0 ? totalGradePoints / totalCredits : 0
  }

  const handleCourseChange = (semesterIndex: number, courseIndex: number, field: 'name' | 'credits' | 'grade', value: string) => {
    const newSemesters = [...semesters]
    if (field === 'name') {
      newSemesters[semesterIndex].courses[courseIndex].name = value
    } else if (field === 'credits') {
      newSemesters[semesterIndex].courses[courseIndex].credits = Number(value)
    } else if (field === 'grade') {
      newSemesters[semesterIndex].courses[courseIndex].grade = Number(value)
    }
    newSemesters[semesterIndex].sgpa = calculateSGPA(newSemesters[semesterIndex].courses)
    setSemesters(newSemesters)
  }

  const addCourse = (semesterIndex: number) => {
    const newSemesters = [...semesters]
    const newCourseNumber = newSemesters[semesterIndex].courses.length + 1
    newSemesters[semesterIndex].courses.push({ name: `Course ${newCourseNumber}`, credits: 0, grade: 0 })
    setSemesters(newSemesters)
  }

  const removeCourse = (semesterIndex: number, courseIndex: number) => {
    const newSemesters = [...semesters]
    newSemesters[semesterIndex].courses.splice(courseIndex, 1)
    // Rename remaining courses
    newSemesters[semesterIndex].courses.forEach((course, index) => {
      course.name = `Course ${index + 1}`
    })
    newSemesters[semesterIndex].sgpa = calculateSGPA(newSemesters[semesterIndex].courses)
    setSemesters(newSemesters)
  }

  const addSemester = () => {
    setSemesters([...semesters, { courses: [{ name: 'Course 1', credits: 0, grade: 0 }], sgpa: 0 }])
  }

  const getCGPAEmoji = (cgpa: number) => {
    if (cgpa === 0) return '🚀'
    if (cgpa > 10 || cgpa < 0) return '⁉️'
    if (cgpa >= 9) return '🏆'
    if (cgpa >= 8) return '😎'
    if (cgpa >= 7) return '😊'
    if (cgpa >= 6) return '🙂'
    if (cgpa >= 5) return '😐'
    return '😟'
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold text-[#c9d1d9] flex items-center">
              <GraduationCap className="mr-2 h-6 w-6 text-[#58a6ff]" />
              CGPA Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-center my-4 bg-clip-text flex items-center justify-center">
              <span >{getCGPAEmoji(calculateCGPA())} </span>
                <span className="ml-4 text-transparent bg-clip-text bg-gradient-to-r from-[#58a6ff] to-[#bc8cff]">{calculateCGPA().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {semesters.map((semester, semesterIndex) => (
          <Card key={semesterIndex} className="bg-[#161b22] border-[#30363d]">
            <CardHeader>
              <CardTitle className="text-xl text-[#c9d1d9] flex items-center">
                <Book className="mr-2 h-5 w-5 text-[#58a6ff]" />
                Semester {semesterIndex + 1}
              </CardTitle>
              <CardDescription className="text-lg font-semibold text-[#58a6ff] flex items-center">
                <Award className="mr-2 h-5 w-5" />
                SGPA: {semester.sgpa.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#8b949e]">Course Name</TableHead>
                    <TableHead className="text-[#8b949e]">Credits</TableHead>
                    <TableHead className="text-[#8b949e]">Grade</TableHead>
                    <TableHead className="text-[#8b949e]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semester.courses.map((course, courseIndex) => (
                    <TableRow key={courseIndex}>
                      <TableCell>
                        <Input
                          value={course.name}
                          onChange={(e) => handleCourseChange(semesterIndex, courseIndex, 'name', e.target.value)}
                          className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={course.credits === 0 ? '' : course.credits}
                          onChange={(e) => handleCourseChange(semesterIndex, courseIndex, 'credits', e.target.value)}
                          min="0"
                          max="10"
                          placeholder="0"
                          className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={course.grade === 0 ? '' : course.grade}
                          onChange={(e) => handleCourseChange(semesterIndex, courseIndex, 'grade', e.target.value)}
                          min="0"
                          max="10"
                          placeholder="0"
                          className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeCourse(semesterIndex, courseIndex)}>
                          <Trash2 className="h-4 w-4 text-[#f85149]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button onClick={() => addCourse(semesterIndex)} variant="outline" className="w-full bg-[#21262d] border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]">
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </CardFooter>
          </Card>
        ))}
        <Button onClick={addSemester} className="w-full bg-[#238636] hover:bg-[#2ea043] text-[#ffffff]">
          <Plus className="mr-2 h-4 w-4" /> Add Semester
        </Button>
      </div>
    </div>
  )
}