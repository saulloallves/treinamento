import { useMemo, useState } from 'react';
import { useLessonsWithSchedule, LessonWithSchedule } from './useLessonsWithSchedule';

export interface PaginatedLessonsResult {
  lessons: LessonWithSchedule[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  filteredLessons: LessonWithSchedule[];
  courses: string[];
  isLoading: boolean;
}

export const usePaginatedLessons = () => {
  const { data: allLessons = [], isLoading } = useLessonsWithSchedule();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const { filteredLessons, courses } = useMemo(() => {
    // Get unique courses
    const uniqueCourses = Array.from(new Set(allLessons.map(lesson => lesson.course_name)));
    
    // Filter lessons based on search and course
    let filtered = allLessons;

    if (searchTerm) {
      filtered = filtered.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse && selectedCourse !== 'all') {
      filtered = filtered.filter(lesson => lesson.course_name === selectedCourse);
    }

    return { filteredLessons: filtered, courses: uniqueCourses };
  }, [allLessons, searchTerm, selectedCourse]);

  const { lessons, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLessons = filteredLessons.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);

    return { lessons: paginatedLessons, totalPages };
  }, [filteredLessons, currentPage, itemsPerPage]);

  const setPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  };

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    setCurrentPage(1); // Reset to first page
  };

  return {
    lessons,
    currentPage,
    totalPages,
    totalItems: filteredLessons.length,
    itemsPerPage,
    setPage,
    setItemsPerPage: handleItemsPerPageChange,
    searchTerm,
    setSearchTerm: handleSearchChange,
    selectedCourse,
    setSelectedCourse: handleCourseChange,
    filteredLessons,
    courses,
    isLoading
  };
};