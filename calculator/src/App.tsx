"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, GraduationCap, Book, Award, Settings } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the type for grade mapping to fix TypeScript errors
interface GradeMapping {
  [key: string]: number
}

const defaultGradeMapping: GradeMapping = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
}

const gradeLetters = Object.keys(defaultGradeMapping)

// Define types for our state
interface Course {
  name: string
  credits: number
  grade: number | string
}

interface Semester {
  courses: Course[]
  sgpa: number
}

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [gradeMode, setGradeMode] = useState<"numerical" | "letter">("numerical")
  const [gradeMapping, setGradeMapping] = useState<GradeMapping>(defaultGradeMapping)
  const [showGradeMappingSettings, setShowGradeMappingSettings] = useState(false)

  const calculateSGPA = (courses: Course[]) => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
    let totalGradePoints = 0
    for (const course of courses) {
      let gradeValue = 0
      if (gradeMode === "numerical") {
        gradeValue = Number(course.grade)
      } else if (gradeMode === "letter") {
        gradeValue = gradeMapping[course.grade as string] || 0 // Use 0 if letter grade is not mapped
      }
      totalGradePoints += course.credits * gradeValue
    }

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0
  }

  const calculateCGPA = () => {
    const totalCredits = semesters.reduce(
      (sum, semester) => sum + semester.courses.reduce((sum, course) => sum + course.credits, 0),
      0,
    )
    let totalGradePoints = 0
    for (const semester of semesters) {
      for (const course of semester.courses) {
        let gradeValue = 0
        if (gradeMode === "numerical") {
          gradeValue = Number(course.grade)
        } else if (gradeMode === "letter") {
          gradeValue = gradeMapping[course.grade as string] || 0 // Use 0 if letter grade is not mapped
        }
        totalGradePoints += course.credits * gradeValue
      }
    }
    return totalCredits > 0 ? totalGradePoints / totalCredits : 0
  }

  const handleCourseChange = (
    semesterIndex: number,
    courseIndex: number,
    field: "name" | "credits" | "grade",
    value: string,
  ) => {
    const newSemesters = [...semesters]
    if (field === "name") {
      newSemesters[semesterIndex].courses[courseIndex].name = value
    } else if (field === "credits") {
      newSemesters[semesterIndex].courses[courseIndex].credits = Number(value)
    } else if (field === "grade") {
      if (gradeMode === "numerical") {
        newSemesters[semesterIndex].courses[courseIndex].grade = Number(value)
      } else if (gradeMode === "letter") {
        newSemesters[semesterIndex].courses[courseIndex].grade = value
      }
    }
    newSemesters[semesterIndex].sgpa = calculateSGPA(newSemesters[semesterIndex].courses)
    setSemesters(newSemesters)
  }

  const addCourse = (semesterIndex: number) => {
    const newSemesters = [...semesters]
    const newCourseNumber = newSemesters[semesterIndex].courses.length + 1
    newSemesters[semesterIndex].courses.push({
      name: `Course ${newCourseNumber}`,
      credits: 0,
      grade: gradeMode === "numerical" ? 0 : "",
    })
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
    setSemesters([
      ...semesters,
      { courses: [{ name: "Course 1", credits: 0, grade: gradeMode === "numerical" ? 0 : "" }], sgpa: 0 },
    ])
  }

  const getCGPAEmoji = (cgpa: number) => {
    if (cgpa === 0) return "🚀"
    if (cgpa > 10 || cgpa < 0) return "⁉️"
    if (cgpa >= 9) return "🏆"
    if (cgpa >= 8) return "😎"
    if (cgpa >= 7) return "😊"
    if (cgpa >= 6) return "🙂"
    if (cgpa >= 5) return "😐"
    return "😟"
  }

  const handleGradeMappingChange = (letterGrade: string, value: number) => {
    setGradeMapping({ ...gradeMapping, [letterGrade]: value })
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
            <CardTitle className="text-xl sm:text-2xl font-bold text-[#c9d1d9] flex items-center">
              <GraduationCap className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-[#58a6ff]" />
              CGPA Calculator
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Label htmlFor="grade-mode" className="text-sm text-[#8b949e] whitespace-nowrap">
                  Grade Mode
                </Label>
                <Select value={gradeMode} onValueChange={(value) => setGradeMode(value as "numerical" | "letter")}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-[#0d1117] border-[#30363d] text-[#c9d1d9] focus:bg-[#161b22] hover:bg-[#161b22]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-[#30363d] text-[#c9d1d9]">
                    <SelectItem value="numerical" className="hover:bg-[#30363d]">
                      Numerical
                    </SelectItem>
                    <SelectItem value="letter" className="hover:bg-[#30363d]">
                      Letter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGradeMappingSettings(!showGradeMappingSettings)}
              >
                <Settings className={cn("h-5 w-5 text-[#c9d1d9]", showGradeMappingSettings && "text-[#58a6ff]")} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl sm:text-5xl font-bold text-center my-4 bg-clip-text flex items-center justify-center">
              <span>{getCGPAEmoji(calculateCGPA())} </span>
              <span className="ml-4 text-transparent bg-clip-text bg-gradient-to-r from-[#58a6ff] to-[#bc8cff]">
                {calculateCGPA().toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {showGradeMappingSettings && gradeMode === "letter" && (
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardHeader>
              <CardTitle className="text-lg text-[#c9d1d9] flex items-center">
                <Settings className="mr-2 h-5 w-5 text-[#58a6ff]" />
                Grade Letter Mapping
              </CardTitle>
              <CardDescription className="text-[#8b949e]">
                Customize the numerical value for each letter grade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#8b949e]">Grade Letter</TableHead>
                      <TableHead className="text-[#8b949e]">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeLetters.map((letter) => (
                      <TableRow key={letter}>
                        <TableCell className="font-medium">{letter}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={gradeMapping[letter]}
                              onChange={(e) => handleGradeMappingChange(letter, Number(e.target.value))}
                              className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] w-24"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {semesters.map((semester, semesterIndex) => (
          <Card key={semesterIndex} className="bg-[#161b22] border-[#30363d]">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-[#c9d1d9] flex items-center">
                <Book className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#58a6ff]" />
                Semester {semesterIndex + 1}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg font-semibold text-[#58a6ff] flex items-center">
                <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                SGPA: {semester.sgpa.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[600px]">
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
                              onChange={(e) => handleCourseChange(semesterIndex, courseIndex, "name", e.target.value)}
                              className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={course.credits === 0 ? "" : course.credits}
                              onChange={(e) =>
                                handleCourseChange(semesterIndex, courseIndex, "credits", e.target.value)
                              }
                              min="0"
                              max="10"
                              placeholder="0"
                              className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] w-20"
                            />
                          </TableCell>
                          <TableCell>
                            {gradeMode === "numerical" ? (
                              <Input
                                type="number"
                                value={course.grade === 0 ? "" : course.grade}
                                onChange={(e) =>
                                  handleCourseChange(semesterIndex, courseIndex, "grade", e.target.value)
                                }
                                min="0"
                                max="10"
                                placeholder="0"
                                className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] w-20"
                              />
                            ) : (
                              <Select
                                value={course.grade as string}
                                onValueChange={(value) =>
                                  handleCourseChange(semesterIndex, courseIndex, "grade", value)
                                }
                              >
                                <SelectTrigger className="w-[80px] bg-[#0d1117] border-[#30363d] text-[#c9d1d9] focus:bg-[#161b22] hover:bg-[#161b22]">
                                  <SelectValue placeholder="Grade" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#161b22] border-[#30363d] text-[#c9d1d9]">
                                  {gradeLetters.map((letter) => (
                                    <SelectItem key={letter} value={letter} className="hover:bg-[#30363d]">
                                      {letter}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCourse(semesterIndex, courseIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-[#f85149]" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => addCourse(semesterIndex)}
                variant="outline"
                className="w-full bg-[#21262d] border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]"
              >
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

