import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  ExternalLink,
  Play,
  BookOpen,
  Loader2,
  MessageSquare,
  Brain,
  FileText,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import {
  getUserRoadmapById,
  fetchNotes,
  saveNote,
  saveProgress,
  generateSubtopicSummary,
  fetchSubtopicExplanation,
  generateQuiz,
  setcurrRoadmap,
  getQuizzes,
} from "../features/roadmapSlicer";

export default function RoadmapDisplay() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currRoadmap, notes, explanation_loading, quizData, quizLoading } =
    useSelector((state) => state.roadmap);

  // UI state
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedSubtopics, setExpandedSubtopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({});

  // Note modal state
  const [noteModal, setNoteModal] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  // Summary modal state
  const [summaryModal, setSummaryModal] = useState(null);
  const [summaryContent, setSummaryContent] = useState("");

  // Quiz modal state
  const [quizModal, setQuizModal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Load roadmap data on page open
  useEffect(() => {
    const load = async () => {
      const res = await dispatch(getUserRoadmapById(id));
      if (res.payload?.success) {
        dispatch(setcurrRoadmap(res.payload.data));
        await dispatch(fetchNotes(id));
        const expRes = await dispatch(
          fetchSubtopicExplanation({ roadmapId: id }),
        );
        if (expRes.payload?.success) setExplanations(expRes.payload.data);
      } else {
        toast.error("Roadmap not found");
        navigate("/roadmaps");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Show loader while fetching
  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
      </div>
    );

  const roadmap = currRoadmap?.roadmapData;
  if (!roadmap) return null;

  // ─── Helper functions ─────────────────────────────────────

  const toggleChapter = (id) =>
    setExpandedChapters((p) => ({ ...p, [id]: !p[id] }));

  const toggleSubtopic = (key) =>
    setExpandedSubtopics((p) => ({ ...p, [key]: !p[key] }));

  const getArticles = (chapterId, subtopicId) => {
    const entry = roadmap.articles?.find(
      (a) => a.chapterId === chapterId && a.subtopicId === subtopicId,
    );
    return entry?.articles || [];
  };

  const getVideos = (chapterId, subtopicId) => {
    const entry = roadmap.videos?.find(
      (v) => v.chapterId === chapterId && v.subtopicId === subtopicId,
    );
    return entry?.videos || [];
  };

  const getChapterProgress = (chapter) => {
    const total = chapter.subtopics.length;
    const done = chapter.subtopics.filter((s) => s.completed).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  };

  // ─── Handlers ─────────────────────────────────────────────

  const handleProgress = async (chapterId, subtopicId) => {
    const res = await dispatch(
      saveProgress({ roadmapId: id, chapterId, subtopicId }),
    );
    if (res.payload?.success) {
      dispatch(setcurrRoadmap(res.payload.data));
    } else {
      toast.error(res.payload?.message || "Failed to update progress");
    }
  };

  const openNote = (chapterId, subtopicId) => {
    const key = `${chapterId}:${subtopicId}`;
    setNoteContent(notes[key] || "");
    setNoteModal({ chapterId, subtopicId });
  };

  const handleSaveNote = async () => {
    const res = await dispatch(
      saveNote({
        roadmapId: id,
        subtopicId: String(noteModal.subtopicId),
        moduleId: String(noteModal.chapterId),
        content: noteContent,
      }),
    );
    if (res.payload?.success) {
      toast.success("Note saved");
      setNoteModal(null);
    } else {
      toast.error(res.payload?.message || "Failed to save note");
    }
  };

  const handleGenerateSummary = async (chapterId, subtopicId) => {
    const key = `${chapterId}:${subtopicId}`;
    if (explanations[key]) {
      setSummaryContent(explanations[key]);
      setSummaryModal({ chapterId, subtopicId });
      return;
    }
    const res = await dispatch(
      generateSubtopicSummary({
        roadmapId: id,
        moduleId: chapterId,
        subtopicId,
      }),
    );
    if (res.payload?.success) {
      setExplanations((p) => ({ ...p, [key]: res.payload.summary }));
      setSummaryContent(res.payload.summary);
      setSummaryModal({ chapterId, subtopicId });
    } else toast.error("Failed to generate summary");
  };

  const handleGenerateQuiz = async (chapterId, subtopicId) => {
    const key = `${chapterId}:${subtopicId}`;
    if (quizData[key]) {
      setQuizModal({ chapterId, subtopicId, quiz: quizData[key] });
      setQuizAnswers({});
      setQuizSubmitted(false);
      return;
    }
    const existing = await dispatch(
      getQuizzes({
        roadmapId: id,
        chapterId: String(chapterId),
        subtopicId: String(subtopicId),
      }),
    );

    if (existing.payload?.data?.length > 0) {
      // Quiz exists in DB — use it
      const quiz = existing.payload.data[0].quiz;
      setQuizModal({ chapterId, subtopicId, quiz });
      setQuizAnswers({});
      setQuizSubmitted(false);
      return;
    }

    const res = await dispatch(
      generateQuiz({
        roadmapId: id,
        moduleId: chapterId,
        subtopicId,
      }),
    );
    if (res.payload?.success) {
      setQuizModal({ chapterId, subtopicId, quiz: res.payload.data });
      setQuizAnswers({});
      setQuizSubmitted(false);
    } else toast.error("Failed to generate quiz");
  };

  const getScore = () => {
    if (!quizModal?.quiz) return 0;
    const questions = quizModal.quiz.quiz || quizModal.quiz;
    return questions.filter((q, i) => quizAnswers[i] === q.correctAnswer)
      .length;
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        {/* Roadmap Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{roadmap.title}</h1>
          <p className="text-slate-400 mb-4">{roadmap.description}</p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {roadmap.difficulty}
            </span>
            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
              {roadmap.estimatedDuration}
            </span>
            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
              {roadmap.chapters?.length} chapters
            </span>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-4">
          {roadmap.chapters?.map((chapter) => {
            const { done, total, pct } = getChapterProgress(chapter);

            return (
              <div
                key={chapter.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
              >
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                      {chapter.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{chapter.title}</h3>
                      <p className="text-sm text-slate-400">
                        {chapter.estimatedTime} • {done}/{total} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Progress Bar */}
                    <div className="hidden sm:block w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    {expandedChapters[chapter.id] ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Subtopics */}
                {expandedChapters[chapter.id] && (
                  <div className="border-t border-slate-700/50 divide-y divide-slate-700/30">
                    {chapter.subtopics?.map((subtopic) => {
                      const stKey = `${chapter.id}-${subtopic.id}`;
                      const noteKey = `${chapter.id}:${subtopic.id}`;
                      const isExpLoading = explanation_loading.includes(
                        `${chapter.id}:${subtopic.id}`,
                      );
                      const isQuizLoading = quizLoading.includes(
                        `${chapter.id}:${subtopic.id}`,
                      );
                      const articles = getArticles(chapter.id, subtopic.id);
                      const videos = getVideos(chapter.id, subtopic.id);

                      return (
                        <div key={subtopic.id} className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            {/* Progress Checkbox */}
                            <button
                              onClick={() =>
                                handleProgress(chapter.id, subtopic.id)
                              }
                              className="mt-0.5 shrink-0"
                            >
                              {subtopic.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-500 hover:text-blue-400 transition-colors" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              {/* Subtopic Title */}
                              <button
                                onClick={() => toggleSubtopic(stKey)}
                                className="w-full text-left"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <h4
                                    className={`font-medium ${subtopic.completed ? "line-through text-slate-500" : ""}`}
                                  >
                                    {subtopic.title}
                                  </h4>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-xs text-slate-500">
                                      {subtopic.estimatedTime}
                                    </span>
                                    {expandedSubtopics[stKey] ? (
                                      <ChevronUp className="h-4 w-4 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-slate-400" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-slate-400 mt-0.5">
                                  {subtopic.description}
                                </p>
                              </button>

                              {/* Expanded Subtopic Content */}
                              {expandedSubtopics[stKey] && (
                                <div className="mt-4 space-y-4">
                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() =>
                                        openNote(chapter.id, subtopic.id)
                                      }
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
                                    >
                                      <FileText className="h-3.5 w-3.5" />
                                      {notes[noteKey]
                                        ? "Edit Note"
                                        : "Add Note"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleGenerateSummary(
                                          chapter.id,
                                          subtopic.id,
                                        )
                                      }
                                      disabled={isExpLoading}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      {isExpLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Brain className="h-3.5 w-3.5" />
                                      )}
                                      AI Summary
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleGenerateQuiz(
                                          chapter.id,
                                          subtopic.id,
                                        )
                                      }
                                      disabled={isQuizLoading}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      {isQuizLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <BookOpen className="h-3.5 w-3.5" />
                                      )}
                                      Quiz
                                    </button>
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/roadmap/${id}/chat/${chapter.id}`,
                                        )
                                      }
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/30 hover:bg-green-600/50 rounded-lg text-xs font-medium transition-colors"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />{" "}
                                      Ask AI
                                    </button>
                                  </div>

                                  {/* Articles */}
                                  {articles.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                                        Articles
                                      </h5>
                                      <div className="space-y-1.5">
                                        {articles.slice(0, 3).map((url, i) => (
                                          <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors truncate"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                              {new URL(url).hostname}
                                            </span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Videos */}
                                  {videos.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                                        Videos
                                      </h5>
                                      <div className="space-y-1.5">
                                        {videos.slice(0, 2).map((url, i) => (
                                          <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors truncate"
                                          >
                                            <Play className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                              {url}
                                            </span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Note Modal ─────────────────────────────────── */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            {/* Header with X */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notes</h3>
              <button
                onClick={() => setNoteModal(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={8}
              placeholder="Write your notes here..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveNote}
                className="flex-1 py-2.5 bg-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Save Note
              </button>
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 py-2.5 bg-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Summary Modal ───────────────────────────────── */}
      {summaryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Header with X */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Summary</h3>
              <button
                onClick={() => setSummaryModal(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {summaryContent}
            </div>
            <button
              onClick={() => setSummaryModal(null)}
              className="mt-6 w-full py-2.5 bg-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── Quiz Modal ──────────────────────────────────── */}
      {quizModal &&
        (() => {
          const questions = quizModal.quiz?.quiz || quizModal.quiz || [];
          return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                {/* Header with X button */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Quiz</h3>
                  <button
                    onClick={() => setQuizModal(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, i) => (
                    <div key={i} className="space-y-3">
                      <p className="font-medium text-sm">
                        {i + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {["a", "b", "c", "d"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              !quizSubmitted &&
                              setQuizAnswers((p) => ({ ...p, [i]: opt }))
                            }
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                              quizSubmitted
                                ? opt === q.correctAnswer
                                  ? "border-green-500 bg-green-500/20 text-green-300"
                                  : quizAnswers[i] === opt
                                    ? "border-red-500 bg-red-500/20 text-red-300"
                                    : "border-slate-700 text-slate-400"
                                : quizAnswers[i] === opt
                                  ? "border-blue-500 bg-blue-500/20 text-white"
                                  : "border-slate-700 text-slate-300 hover:border-slate-600"
                            }`}
                          >
                            <span className="font-medium uppercase">
                              {opt}.
                            </span>{" "}
                            {q.options?.[opt]}
                          </button>
                        ))}
                      </div>
                      {quizSubmitted && q.explanation && (
                        <p className="text-xs text-slate-400 bg-slate-800 rounded-lg p-3">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={
                        Object.keys(quizAnswers).length < questions.length
                      }
                      className="w-full py-3 bg-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-2xl font-bold mb-1">
                        {getScore()} / {questions.length}
                      </p>
                      <p className="text-slate-400 text-sm mb-4">
                        {getScore() === questions.length
                          ? "🎉 Perfect score!"
                          : getScore() >= questions.length / 2
                            ? "👍 Good job!"
                            : "📚 Keep studying!"}
                      </p>
                      <button
                        onClick={() => setQuizModal(null)}
                        className="px-6 py-2.5 bg-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-600 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
