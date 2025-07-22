"use client";
import { useEffect, useState } from "react";
import { Star, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface TeamVoteRow {
  id: string;
  name: string;
  cohortName: string;
  votes: number;
  userVote: number | null;
  workspaceId: string;
}

// ✅ Remove cohortId dependency - make it global
export function VotingBoard() {
  const [teams, setTeams] = useState<TeamVoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  // const workspaceId = useWorkspaceId();

  const load = async () => {
    setLoading(true);
    try {
      // ✅ No cohortId needed - fetch ALL teams from all active cohorts
      const res = await fetch(`/api/sprint/vote`);
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const vote = async (teamId: string, score: number) => {

    const alreadyVotedFor = getVotedTeamId();
    if (alreadyVotedFor && alreadyVotedFor !== teamId) {
      alert("❌ You have already voted for another team. You cannot vote more than once.");
      return;
    }

    const confirmVote = window.confirm("⚠️ Are you sure you want to vote? You can vote only once.");
    if (!confirmVote) return;



    setVotingFor(teamId);
    try {
      await fetch(`/api/sprint/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId, score }),
      });
      await load();
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setVotingFor(null);
    }
  };

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <Users className="w-6 h-6 text-blue-500" />;
    }
  };

  const getPositionBadge = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 2:
        return "bg-gradient-to-r from-amber-500 to-amber-700 text-white";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
    }
  };

  // ✅ Check if current user has already voted (on any team)
  const getVotedTeamId = () => {
    const votedTeam = teams.find(team => team.userVote !== null);
    return votedTeam?.id ?? null;
  };


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-6 text-gray-600 text-lg">Loading teams...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-6">🗳️</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          No Active Teams
        </h3>
        <p className="text-gray-600 text-lg">
          There are currently no teams available for voting. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{teams.length}</div>
              <div className="text-blue-600 text-sm font-medium">Active Teams</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {teams.reduce((sum, team) => sum + team.votes, 0)}
              </div>
              <div className="text-purple-600 text-sm font-medium">Total Votes</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-emerald-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-emerald-700">
                {teams.filter(team => team.userVote !== null).length}
              </div>
              <div className="text-emerald-600 text-sm font-medium">Your Votes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {teams.map((team, index) => (
          <div
            key={team.id}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Position Badge */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPositionBadge(index)}`}>
                  <span className="font-bold text-lg">#{index + 1}</span>
                </div>

                {/* Position Icon */}
                <div className="flex items-center justify-center w-10 h-10">
                  {getPositionIcon(index)}
                </div>

                {/* Team Info */}
                <div>
                  <Link href={`/team/${team.id}`}>
                    <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
                      {team.name}
                    </h3>
                  </Link>
                  <div className="flex items-center text-gray-600 text-sm space-x-2">
                    <span>🏆 {team.cohortName}</span>
                    <span>•</span>
                    <span>📊 {team.votes} votes</span>
                  </div>
                </div>
              </div>

              {/* Voting Section */}
              <div className="flex items-center space-x-3">
                {/* Current User Vote Display */}
                {team.userVote !== null && (
                  <div className="flex items-center bg-blue-50 rounded-full px-3 py-1 border border-blue-200">
                    <Star className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-blue-700 font-semibold text-sm">
                      Your vote: {team.userVote}
                    </span>
                  </div>
                )}

                {/* Vote Buttons */}
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => vote(team.id, score)}
                      disabled={
                        votingFor === team.id ||
                        Boolean(getVotedTeamId() && getVotedTeamId() !== team.id)
                      }


                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                        transition-all duration-200 hover:scale-110
                        ${team.userVote === score
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }
                        ${votingFor === team.id ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {votingFor === team.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : (
                        score
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Community Support</span>
                <span className="text-sm font-bold text-gray-800">{team.votes} points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${index === 0
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                    : index === 1
                      ? "bg-gradient-to-r from-gray-400 to-gray-600"
                      : index === 2
                        ? "bg-gradient-to-r from-amber-500 to-amber-700"
                        : "bg-gradient-to-r from-blue-500 to-blue-600"
                    }`}
                  style={{
                    width: teams.length > 0 ? `${(team.votes / Math.max(...teams.map(t => t.votes), 1)) * 100}%` : "0%"
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center py-6">
        <p className="text-gray-500 text-sm">
          🌟 Vote for your favorite teams! You can change your vote anytime.
        </p>
      </div>
    </div>
  );
}