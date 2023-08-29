import { useNavigate } from "react-router-dom";
import Client from "../client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiOptions, ApiServiceErr, Assessment, AssessmentDetailsResponse, AssessmentListResponse } from "../../types";


export function useCreateAssessment (token: string) {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (postData:{validation_id: number, template_id:number, assessment_doc:Assessment}) => {
            return Client(token).post("/assessments",postData)
        },
        // for the time being redirect to assessment list
        onSuccess: () => {
            navigate("/assessments")
        }
    })
}

export function useUpdateAssessment (token: string, assessmentID: string| undefined) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (putData:{assessment_doc:Assessment}) => {
            return Client(token).put(`/assessments/${assessmentID}`,putData)
        },
        // for the time being redirect to assessment list
        onSuccess: () => {
            queryClient.invalidateQueries(["assessment", { assessmentID }])
            navigate("/assessments")
        }
    })
}


export function useGetAssessments({ size, page, sortBy, token, isRegistered }: ApiOptions){
    return useQuery<AssessmentListResponse, any>({
      queryKey: ["assessments", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<AssessmentListResponse>(
          `/assessments?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered,
    })
}


export function useGetAssessment({ id, token, isRegistered }: {id:number, token:string, isRegistered:boolean}){
    return useQuery<AssessmentDetailsResponse, any>({
      queryKey: ["assessment", { id }],
      queryFn: async () => {
        const response = await Client(token).get<AssessmentDetailsResponse>(
          `/assessments/${id}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered && !isNaN(id),
    })
}