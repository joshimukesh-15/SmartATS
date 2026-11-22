import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateApplicationStage,
  addApplicationNote,
  fetchApplicationHistory,
} from '../api/applications';
import { queryKeys } from '../api/queryKeys';

export function useApplicationHistory(applicationId) {
  return useQuery({
    queryKey: queryKeys.applications.history(applicationId),
    queryFn: () => fetchApplicationHistory(applicationId),
    enabled: Boolean(applicationId),
  });
}

export function useUpdateApplicationStage(jobId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, stage, note, changed_by }) =>
      updateApplicationStage(applicationId, { stage, note, changed_by }),
    onMutate: async ({ applicationId, stage, note, changed_by }) => {
      const rankingsKey = jobId ? queryKeys.jobs.rankings(jobId) : ['jobs', 'rankings'];
      const historyKey = queryKeys.applications.history(applicationId);

      await queryClient.cancelQueries({ queryKey: rankingsKey });
      await queryClient.cancelQueries({ queryKey: historyKey });

      const previousRankings = queryClient.getQueryData(rankingsKey);
      const previousHistory = queryClient.getQueryData(historyKey);

      // Optimistically update candidate in rankings cache
      queryClient.setQueryData(rankingsKey, (old) => {
        if (!old) return old;
        const rankings = old.rankings || old;
        if (!Array.isArray(rankings)) return old;

        const updated = rankings.map((cand) => {
          const id = cand.application_id ?? cand.id ?? cand.candidate_id;
          if (String(id) === String(applicationId)) {
            return {
              ...cand,
              review_stage: stage,
              stage,
            };
          }
          return cand;
        });

        return old.rankings ? { ...old, rankings: updated } : updated;
      });

      // Optimistically append to history cache
      queryClient.setQueryData(historyKey, (old) => {
        const historyList = Array.isArray(old) ? old : [];
        const prevCand = previousRankings?.rankings?.find?.(
          (c) => String(c.application_id) === String(applicationId)
        );
        return [
          {
            history_id: `temp-${Date.now()}`,
            application_id: applicationId,
            from_stage: prevCand?.review_stage || 'New',
            to_stage: stage,
            note: note || null,
            changed_by: changed_by || 'Recruiter',
            created_at: new Date().toISOString(),
          },
          ...historyList,
        ];
      });

      return { previousRankings, previousHistory, rankingsKey, historyKey };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousRankings) {
        queryClient.setQueryData(context.rankingsKey, context.previousRankings);
      }
      if (context?.previousHistory) {
        queryClient.setQueryData(context.historyKey, context.previousHistory);
      }
    },
    onSuccess: (data, variables) => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rankings(jobId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.analytics(jobId) });
      }
      queryClient.invalidateQueries({ queryKey: ['jobs', 'rankings'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.history(variables.applicationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview() });
    },
  });
}

export function useAddApplicationNote(jobId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, content, author }) =>
      addApplicationNote(applicationId, { content, author }),
    onMutate: async ({ applicationId, content, author }) => {
      const historyKey = queryKeys.applications.history(applicationId);
      await queryClient.cancelQueries({ queryKey: historyKey });
      const previousHistory = queryClient.getQueryData(historyKey);

      queryClient.setQueryData(historyKey, (old) => {
        const historyList = Array.isArray(old) ? old : [];
        return [
          {
            note_id: `temp-${Date.now()}`,
            application_id: applicationId,
            content,
            author: author || 'Recruiter',
            created_at: new Date().toISOString(),
          },
          ...historyList,
        ];
      });

      return { previousHistory, historyKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(context.historyKey, context.previousHistory);
      }
    },
    onSuccess: (data, variables) => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rankings(jobId) });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.history(variables.applicationId),
      });
    },
  });
}
